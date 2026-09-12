package moe.shizuku.manager.cache

import android.content.pm.ApplicationInfo
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
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

class CacheClearActivity : AppBarActivity() {

    private var appCount = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        appCount = packageManager.getInstalledApplications(0)
            .count { it.packageName != packageName && (it.flags and ApplicationInfo.FLAG_SYSTEM) == 0 }

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 24, 24, 24)
        }
        root.addView(TextView(this).apply {
            text = getString(R.string.cache_clear_description)
            textSize = 16f
        })
        root.addView(TextView(this).apply {
            text = resources.getQuantityString(R.plurals.cache_clear_app_count, appCount, appCount)
            setPadding(0, 24, 0, 24)
        })
        root.addView(Button(this).apply {
            text = getString(R.string.cache_clear_button)
            isEnabled = appCount > 0
            setOnClickListener { confirmClear() }
        })
        root.addView(TextView(this).apply {
            text = getString(R.string.cache_clear_no_data_warning)
            gravity = Gravity.CENTER
            setPadding(0, 32, 0, 0)
        })
        setContentView(root)
    }

    private fun confirmClear() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.cache_clear_confirm_title)
            .setMessage(getString(R.string.cache_clear_confirm_message, appCount))
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(R.string.cache_clear_button) { _, _ -> clearCache() }
            .show()
    }

    private fun clearCache() {
        lifecycleScope.launch {
            val error = withContext(Dispatchers.IO) {
                try {
                    // newProcess is hidden in recent Shizuku API versions. Manager enables
                    // hidden-API access, so invoke the compatible method reflectively.
                    val method: Method = Shizuku::class.java.getDeclaredMethod(
                        "newProcess", Array<String>::class.java, Array<String>::class.java, String::class.java
                    )
                    method.isAccessible = true
                    val process = method.invoke(null, arrayOf("pm", "trim-caches", "0"), null, null) as Process
                    val output = BufferedReader(InputStreamReader(process.inputStream)).use { it.readText() }
                    if (process.waitFor() == 0) null else output.ifBlank { "exit code ${process.exitValue()}" }
                } catch (e: Throwable) {
                    e.message ?: e.javaClass.simpleName
                }
            }
            val message = if (error == null) {
                getString(R.string.cache_clear_success)
            } else {
                getString(R.string.cache_clear_failed, error)
            }
            android.widget.Toast.makeText(this@CacheClearActivity, message, android.widget.Toast.LENGTH_LONG).show()
        }
    }
}
