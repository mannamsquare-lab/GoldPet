package com.mannam.goldpet

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

class WalkNotificationHelper(private val context: Context) {
    companion object {
        const val CHANNEL_ID = "walk_widget"
        const val NOTIFICATION_ID = 9998
    }

    init {
        createChannel()
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "산책 위젯",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "산책 중 잠금화면 위젯"
                setShowBadge(false)
            }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    fun show(time: String, distance: String, duration: String, pace: String) {
        val layout = RemoteViews(context.packageName, R.layout.notification_walk)
        layout.setTextViewText(R.id.walk_time, time)
        layout.setTextViewText(R.id.walk_distance, distance)
        layout.setTextViewText(R.id.walk_duration, duration)
        layout.setTextViewText(R.id.walk_pace, pace)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setCustomContentView(layout)
            .setCustomBigContentView(layout)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setAutoCancel(false)
            .setShowWhen(false)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    fun cancel() {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(NOTIFICATION_ID)
    }
}
