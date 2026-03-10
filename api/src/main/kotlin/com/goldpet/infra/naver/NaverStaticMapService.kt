package com.goldpet.infra.naver

import org.locationtech.jts.geom.Coordinate
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.DefaultUriBuilderFactory

@Service
class NaverStaticMapService(
    @Value("\${ncp.maps.client-id:}") private val clientId: String,
    @Value("\${ncp.maps.client-secret:}") private val clientSecret: String
) {
    private val log = LoggerFactory.getLogger(NaverStaticMapService::class.java)
    private val restTemplate = RestTemplate(SimpleClientHttpRequestFactory().apply {
        setConnectTimeout(5000)
        setReadTimeout(5000)
    }).apply {
        // Disable URI encoding to preserve | (pipe) delimiters and %20 in coordinates
        uriTemplateHandler = DefaultUriBuilderFactory().apply {
            encodingMode = DefaultUriBuilderFactory.EncodingMode.NONE
        }
    }

    companion object {
        private const val STATIC_MAP_URL = "https://maps.apigw.ntruss.com/map-static/v2/raster"
        private const val MAX_PATH_POINTS = 50
    }

    /**
     * Fetch a static map image with route overlay from Naver Static Map API.
     *
     * @param coordinates JTS Coordinate array from Walk.path (x=longitude, y=latitude)
     * @param width image width in pixels
     * @param height image height in pixels
     * @return PNG image bytes, or null if API call fails
     */
    fun getStaticMapImage(coordinates: Array<Coordinate>, width: Int, height: Int): ByteArray? {
        if (coordinates.size < 2) return null

        val simplified = simplifyPath(coordinates, MAX_PATH_POINTS)

        // Calculate center and zoom from bounding box
        val lngs = simplified.map { it.x }
        val lats = simplified.map { it.y }
        val centerLng = (lngs.min() + lngs.max()) / 2
        val centerLat = (lats.min() + lats.max()) / 2
        val zoom = calculateZoom(lats.min(), lats.max(), lngs.min(), lngs.max())

        // Build path parameter: color:0xRRGGBBAA|weight:N|lng1%20lat1|lng2%20lat2|...
        // Coordinates use %20 (URL-encoded space) between lng and lat per Naver API spec
        val pathParts = simplified.joinToString("|") {
            "%.6f".format(it.x) + "%20" + "%.6f".format(it.y)
        }
        val pathParam = "color:0xFF5A5FFF|weight:4|$pathParts"

        // Build markers for start and end points
        val startCoord = simplified.first()
        val endCoord = simplified.last()
        val startMarker = "type:d|size:small|pos:%.6f".format(startCoord.x) + "%20" + "%.6f".format(startCoord.y) + "|color:green"
        val endMarker = "type:d|size:small|pos:%.6f".format(endCoord.x) + "%20" + "%.6f".format(endCoord.y) + "|color:red"

        // Encode | as %7C so the URL is valid URI syntax.
        // With EncodingMode.NONE, %7C won't be double-encoded; the server decodes it back to |
        val url = (STATIC_MAP_URL +
            "?w=$width&h=$height" +
            "&center=%.6f,%.6f".format(centerLng, centerLat) +
            "&level=$zoom" +
            "&path=$pathParam" +
            "&markers=$startMarker" +
            "&markers=$endMarker").replace("|", "%7C")

        val headers = HttpHeaders().apply {
            set("x-ncp-apigw-api-key-id", clientId)
            set("x-ncp-apigw-api-key", clientSecret)
        }

        return try {
            val response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity<String>(headers),
                ByteArray::class.java
            )
            response.body
        } catch (e: Exception) {
            log.warn("Static map API call failed: {}", e.message)
            null
        }
    }

    /**
     * Uniform sampling to reduce path points for URL length constraints.
     * Always includes first and last points.
     */
    private fun simplifyPath(coordinates: Array<Coordinate>, maxPoints: Int): List<Coordinate> {
        if (coordinates.size <= maxPoints) return coordinates.toList()

        val result = mutableListOf<Coordinate>()
        result.add(coordinates.first())

        val step = (coordinates.size - 1).toDouble() / (maxPoints - 1)
        for (i in 1 until maxPoints - 1) {
            val index = (i * step).toInt().coerceIn(1, coordinates.size - 2)
            result.add(coordinates[index])
        }

        result.add(coordinates.last())
        return result
    }

    /**
     * Calculate appropriate zoom level based on coordinate spread.
     */
    private fun calculateZoom(minLat: Double, maxLat: Double, minLng: Double, maxLng: Double): Int {
        val latSpread = maxLat - minLat
        val lngSpread = maxLng - minLng
        val maxSpread = maxOf(latSpread, lngSpread)

        return when {
            maxSpread > 0.1 -> 12
            maxSpread > 0.05 -> 13
            maxSpread > 0.02 -> 14
            maxSpread > 0.01 -> 15
            maxSpread > 0.005 -> 16
            else -> 17
        }
    }
}
