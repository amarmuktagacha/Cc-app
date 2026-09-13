package moe.shizuku.manager.cache

import android.content.pm.ApplicationInfo
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import moe.shizuku.manager.R
import moe.shizuku.manager.app.AppBarActivity
import rikka.shizuku.Shizuku
import java.io.BufferedReader
import java.io.InputStreamReader
import java.lang.reflect.Method

/** Per-application cache cleanup screen integrated into Shizuku Manager. */
class CacheClearActivity : AppBarActivity() {

    private lateinit var list: LinearLayout
    private val apps by lazy {
        packageManager.getInstalledApplications(0)
            .filter { it.packageName != packageName }
            .sortedBy { it.loadLabel(packageManager).toString().lowercase() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 16, 24, 16)
        }
        root.addView(TextView(this).apply {
            text = getString(R.string.cache_clear_description)
            textSize = 16f
            setPadding(0, 0, 0, 16)
        })
        root.addView(TextView(this).apply {
            text = resources.getQuantityString(R.plurals.cache_clear_app_count, apps.size, apps.size)
            setPadding(0, 0, 0, 16)
        })
        root.addView(Button(this).apply {
            text = getString(R.string.cache_clear_all_button)
            isEnabled = apps.isNotEmpty()
            setOnClickListener { confirmClearAll(this) }
        })

        list = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        if (apps.isEmpty()) {
            list.addView(TextView(this).apply { text = getString(R.string.cache_clear_no_apps) })
        } else {
            apps.forEach { addAppRow(it) }
        }
        root.addView(ScrollView(this).apply {
            addView(list)
            layoutParams = LinearLayout.LayoutParams(-1, 0, 1f)
        })
        root.addView(TextView(this).apply {
            text = getString(R.string.cache_clear_no_data_warning)
            gravity = Gravity.CENTER
            setPadding(0, 16, 0, 0)
        })
        setContentView(root)
    }

    private fun confirmClearAll(button: Button) {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.cache_clear_all_confirm_title)
            .setMessage(getString(R.string.cache_clear_all_confirm_message, apps.size))
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(R.string.cache_clear_all_button) { _, _ -> clearAllCaches(button) }
            .show()
    }

    private fun clearAllCaches(allButton: Button) {
        allButton.isEnabled = false
        allButton.text = getString(R.string.cache_clear_working)
        lifecycleScope.launch {
            val result = withContext(Dispatchers.IO) {
                var cleared = 0
                var failed = 0
                apps.forEach { info ->
                    if (clearPackageCache(info.packageName) == null) cleared++ else failed++
                }
                cleared to failed
            }
            allButton.isEnabled = true
            allButton.text = getString(R.string.cache_clear_all_button)
            android.widget.Toast.makeText(
                this@CacheClearActivity,
                getString(R.string.cache_clear_all_result, result.first, result.second),
                android.widget.Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun addAppRow(info: ApplicationInfo) {
        val label = info.loadLabel(packageManager).toString()
        val row = LinearLayout(this).apply {
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 6, 0, 6)
        }
        row.addView(TextView(this).apply {
            text = label
            textSize = 16f
            layoutParams = LinearLayout.LayoutParams(0, -2, 1f)
        })
        row.addView(Button(this).apply {
            text = getString(R.string.cache_clear_app_button)
            setOnClickListener { confirmClear(info, label, row, this) }
        })
        list.addView(row)
    }

    private fun confirmClear(info: ApplicationInfo, label: String, row: LinearLayout, button: Button) {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.cache_clear_confirm_title)
            .setMessage(getString(R.string.cache_clear_app_confirm_message, label))
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(R.string.cache_clear_app_button) { _, _ -> clearCache(info, row, button) }
            .show()
    }

    private fun clearCache(info: ApplicationInfo, row: LinearLayout, button: Button) {
        button.isEnabled = false
        button.text = getString(R.string.cache_clear_working)
        lifecycleScope.launch {
            val error = withContext(Dispatchers.IO) {
                clearPackageCache(info.packageName)
            }
            if (error == null) {
                button.text = getString(R.string.cache_clear_done)
                android.widget.Toast.makeText(this@CacheClearActivity, R.string.cache_clear_app_success, android.widget.Toast.LENGTH_SHORT).show()
            } else {
                button.isEnabled = true
                button.text = getString(R.string.cache_clear_app_button)
                android.widget.Toast.makeText(this@CacheClearActivity, getString(R.string.cache_clear_failed, error), android.widget.Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun clearPackageCache(packageName: String): String? {
        return try {
            val method: Method = Shizuku::class.java.getDeclaredMethod(
                "newProcess", Array<String>::class.java, Array<String>::class.java, String::class.java
            )
            method.isAccessible = true
            val process = method.invoke(
                null,
                arrayOf("pm", "clear", "--cache-only", packageName),
                null,
                null
            ) as Process
            val output = BufferedReader(InputStreamReader(process.inputStream)).use { it.readText() }
            if (process.waitFor() == 0) null else output.ifBlank { "exit code ${process.exitValue()}" }
        } catch (e: Throwable) {
            e.message ?: e.javaClass.simpleName
        }
    }
}
