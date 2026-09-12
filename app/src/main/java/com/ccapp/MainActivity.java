package com.ccapp;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import rikka.shizuku.Shizuku;

/** A deliberately narrow cache-only cleanup screen. It never touches app data or user files. */
public final class MainActivity extends Activity {
    private static final int SHIZUKU_REQUEST_CODE = 1001;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private TextView statusView;
    private Button cleanupButton;
    private ProgressBar progress;

    private final Shizuku.OnRequestPermissionResultListener permissionListener =
            (requestCode, grantResult) -> mainHandler.post(() -> updateShizukuStatus());

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setTitle(R.string.app_name);
        buildUi();
        Shizuku.addRequestPermissionResultListener(permissionListener);
        updateShizukuStatus();
    }

    @Override protected void onDestroy() {
        Shizuku.removeRequestPermissionResultListener(permissionListener);
        super.onDestroy();
    }

    private void buildUi() {
        int pad = (int) (getResources().getDisplayMetrics().density * 24);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(pad, pad, pad, pad);

        TextView title = new TextView(this);
        title.setText(R.string.cache_cleanup_title);
        title.setTextSize(26);
        title.setGravity(Gravity.CENTER_HORIZONTAL);
        content.addView(title, new LinearLayout.LayoutParams(-1, -2));

        TextView explanation = new TextView(this);
        explanation.setText(R.string.cache_cleanup_explanation);
        explanation.setTextSize(16);
        explanation.setPadding(0, pad / 2, 0, pad / 2);
        content.addView(explanation, new LinearLayout.LayoutParams(-1, -2));

        statusView = new TextView(this);
        statusView.setTextSize(15);
        statusView.setPadding(0, 0, 0, pad / 2);
        content.addView(statusView, new LinearLayout.LayoutParams(-1, -2));

        Button grantButton = new Button(this);
        grantButton.setText(R.string.shizuku_grant);
        grantButton.setOnClickListener(v -> requestShizukuPermission());
        content.addView(grantButton, new LinearLayout.LayoutParams(-1, -2));

        cleanupButton = new Button(this);
        cleanupButton.setText(R.string.clean_cache_button);
        cleanupButton.setOnClickListener(v -> showConfirmation());
        content.addView(cleanupButton, new LinearLayout.LayoutParams(-1, -2));

        progress = new ProgressBar(this);
        progress.setVisibility(View.GONE);
        content.addView(progress, new LinearLayout.LayoutParams(-2, -2));

        TextView note = new TextView(this);
        note.setText(R.string.cache_cleanup_note);
        note.setTextSize(14);
        note.setPadding(0, pad, 0, 0);
        content.addView(note, new LinearLayout.LayoutParams(-1, -2));

        ScrollView scroll = new ScrollView(this);
        scroll.addView(content);
        setContentView(scroll);
    }

    private boolean shizukuAvailable() {
        try { return Shizuku.pingBinder(); } catch (Throwable ignored) { return false; }
    }

    private boolean shizukuAuthorized() {
        try { return Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED; }
        catch (Throwable ignored) { return false; }
    }

    private void updateShizukuStatus() {
        if (!shizukuAvailable()) {
            statusView.setText(R.string.shizuku_not_running);
            cleanupButton.setEnabled(false);
        } else if (!shizukuAuthorized()) {
            statusView.setText(R.string.shizuku_permission_needed);
            cleanupButton.setEnabled(false);
        } else {
            statusView.setText(R.string.shizuku_ready);
            cleanupButton.setEnabled(true);
        }
    }

    private void requestShizukuPermission() {
        if (!shizukuAvailable()) {
            showToast(R.string.shizuku_not_running);
            return;
        }
        try {
            if (!shizukuAuthorized()) Shizuku.requestPermission(SHIZUKU_REQUEST_CODE);
            else updateShizukuStatus();
        } catch (Throwable error) {
            showToast(R.string.shizuku_unavailable);
        }
    }

    private void showConfirmation() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.confirm_title)
                .setMessage(R.string.confirm_message)
                .setNegativeButton(android.R.string.cancel, null)
                .setPositiveButton(R.string.confirm_action, (dialog, which) -> trimCaches())
                .show();
    }

    private void trimCaches() {
        if (!shizukuAvailable() || !shizukuAuthorized()) {
            updateShizukuStatus();
            showToast(R.string.shizuku_unavailable);
            return;
        }
        cleanupButton.setEnabled(false);
        progress.setVisibility(View.VISIBLE);
        statusView.setText(R.string.cleaning);
        new Thread(() -> {
            String output = "";
            int exitCode = -1;
            try {
                // pm trim-caches only asks PackageManager to reclaim package cache files.
                // It does not clear app data, accounts, media, documents, or other user files.
                Process process = Shizuku.newProcess(new String[]{"/system/bin/pm", "trim-caches", "999G"}, null, null);
                output = readAll(process.getInputStream()) + readAll(process.getErrorStream());
                exitCode = process.waitFor();
            } catch (SecurityException e) {
                output = e.getMessage() == null ? "" : e.getMessage();
            } catch (Exception e) {
                output = e.getClass().getSimpleName();
            }
            final int result = exitCode;
            final String details = output;
            mainHandler.post(() -> {
                progress.setVisibility(View.GONE);
                updateShizukuStatus();
                if (result == 0) showToast(R.string.cleanup_complete);
                else showToast(getString(R.string.cleanup_failed, details.trim()));
            });
        }, "cache-cleanup").start();
    }

    private static String readAll(InputStream stream) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int count;
        while ((count = stream.read(buffer)) != -1) out.write(buffer, 0, count);
        return out.toString(StandardCharsets.UTF_8.name());
    }

    private void showToast(int id) { Toast.makeText(this, id, Toast.LENGTH_LONG).show(); }
}
