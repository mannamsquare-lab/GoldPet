package com.goldpet.domain.community.util

import java.net.URI

object YoutubeUrlValidator {

    private val ALLOWED_HOSTS = setOf(
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com"
    )

    private val VIDEO_ID_REGEX = Regex("^[A-Za-z0-9_-]{11}$")

    fun normalize(rawUrl: String?): String? {
        if (rawUrl.isNullOrBlank()) return null

        val uri = try {
            URI(rawUrl.trim())
        } catch (e: Exception) {
            return null
        }

        val scheme = uri.scheme?.lowercase() ?: return null
        if (scheme != "http" && scheme != "https") return null

        val host = uri.host?.lowercase() ?: return null
        if (!ALLOWED_HOSTS.contains(host)) return null

        val videoId = extractVideoId(uri, host) ?: return null
        if (!VIDEO_ID_REGEX.matches(videoId)) return null

        return "https://www.youtube-nocookie.com/embed/$videoId"
    }

    private fun extractVideoId(uri: URI, host: String): String? {
        val path = uri.path ?: ""

        return when {
            // youtu.be/{id}
            host == "youtu.be" -> path.removePrefix("/").substringBefore("/").takeIf { it.isNotBlank() }

            // /watch?v=...
            path == "/watch" || path.endsWith("/watch") -> {
                parseQueryParam(uri.query, "v")
            }

            // /shorts/{id}
            path.contains("/shorts/") -> {
                path.substringAfter("/shorts/").substringBefore("/").substringBefore("?").takeIf { it.isNotBlank() }
            }

            // /embed/{id}
            path.contains("/embed/") -> {
                path.substringAfter("/embed/").substringBefore("/").substringBefore("?").takeIf { it.isNotBlank() }
            }

            else -> null
        }
    }

    private fun parseQueryParam(query: String?, param: String): String? {
        if (query.isNullOrBlank()) return null
        return query.split("&")
            .firstOrNull { it.startsWith("$param=") }
            ?.substringAfter("$param=")
            ?.takeIf { it.isNotBlank() }
    }
}
