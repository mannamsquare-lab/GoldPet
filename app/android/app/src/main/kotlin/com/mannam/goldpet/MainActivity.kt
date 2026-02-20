package com.mannam.goldpet

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import androidx.core.content.FileProvider
import java.io.File

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.mannam.goldpet/file_provider"
    private var walkNotificationHelper: WalkNotificationHelper? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "getContentUri") {
                val filePath = call.argument<String>("filePath")
                if (filePath != null) {
                    try {
                        val file = File(filePath)
                        val contentUri = FileProvider.getUriForFile(
                            this,
                            "${applicationContext.packageName}.fileprovider",
                            file
                        )
                        result.success(contentUri.toString())
                    } catch (e: Exception) {
                        result.error("FILE_PROVIDER_ERROR", e.message, null)
                    }
                } else {
                    result.error("INVALID_PATH", "File path is null", null)
                }
            } else {
                result.notImplemented()
            }
        }

        // Walk notification MethodChannel (custom RemoteViews widget)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.mannam.goldpet/walk_notification").setMethodCallHandler { call, result ->
            when (call.method) {
                "show" -> {
                    if (walkNotificationHelper == null) {
                        walkNotificationHelper = WalkNotificationHelper(this)
                    }
                    val time = call.argument<String>("time") ?: "00:00:00"
                    val distance = call.argument<String>("distance") ?: "0.00"
                    val duration = call.argument<String>("duration") ?: "00:00"
                    val pace = call.argument<String>("pace") ?: "0'00\""
                    walkNotificationHelper!!.show(time, distance, duration, pace)
                    result.success(null)
                }
                "cancel" -> {
                    walkNotificationHelper?.cancel()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }
}
