package com.mannam.goldpet

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat

class WalkNotificationHelper(private val context: Context) {
    companion object {
        const val CHANNEL_ID = "walk_widget"
        const val NOTIFICATION_ID = 9998
    }

    // Cached PendingIntents — created once, reused every second
    private val contentIntent: PendingIntent
    private val peePendingIntent: PendingIntent
    private val poopPendingIntent: PendingIntent
    private val photoPendingIntent: PendingIntent

    init {
        createChannel()
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        contentIntent = PendingIntent.getActivity(
            context, 0,
            Intent(Intent.ACTION_VIEW, Uri.parse("goldpet://walk")),
            flags
        )
        peePendingIntent = PendingIntent.getActivity(
            context, 1,
            Intent(Intent.ACTION_VIEW, Uri.parse("goldpet://spot/pee")),
            flags
        )
        poopPendingIntent = PendingIntent.getActivity(
            context, 2,
            Intent(Intent.ACTION_VIEW, Uri.parse("goldpet://spot/poop")),
            flags
        )
        photoPendingIntent = PendingIntent.getActivity(
            context, 3,
            Intent(Intent.ACTION_VIEW, Uri.parse("goldpet://spot/photo")),
            flags
        )
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

        // Set click handlers for spot buttons
        layout.setOnClickPendingIntent(R.id.btn_pee, peePendingIntent)
        layout.setOnClickPendingIntent(R.id.btn_poop, poopPendingIntent)
        layout.setOnClickPendingIntent(R.id.btn_photo, photoPendingIntent)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setCustomContentView(layout)
            .setCustomBigContentView(layout)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setContentIntent(contentIntent)
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
