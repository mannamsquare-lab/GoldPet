package com.goldpet.domain.walk.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod

@Service
class NaverGeocodingService(
    @Value("\${ncp.maps.client-id:}") private val clientId: String,
    @Value("\${ncp.maps.client-secret:}") private val clientSecret: String
) {
    private val restTemplate = RestTemplate()

    fun reverseGeocode(lat: Double, lng: Double): String {
        val url = "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=$lng,$lat&output=json&orders=legalcode"

        val headers = HttpHeaders()
        headers.set("x-ncp-apigw-api-key-id", clientId)
        headers.set("x-ncp-apigw-api-key", clientSecret)

        return try {
            val response = restTemplate.exchange(url, HttpMethod.GET, HttpEntity<String>(headers), Map::class.java)
            val body = response.body ?: return "알 수 없는 위치"

            // Parse NCP response to extract area name
            // Response structure: { results: [{ region: { area1: {name}, area2: {name}, area3: {name} } }] }
            val results = (body["results"] as? List<*>)?.firstOrNull() as? Map<*, *>
            val region = results?.get("region") as? Map<*, *>
            val area1 = (region?.get("area1") as? Map<*, *>)?.get("name") as? String ?: ""
            val area2 = (region?.get("area2") as? Map<*, *>)?.get("name") as? String ?: ""
            val area3 = (region?.get("area3") as? Map<*, *>)?.get("name") as? String ?: ""

            listOf(area1, area2, area3).filter { it.isNotBlank() }.joinToString(" ").ifBlank { "알 수 없는 위치" }
        } catch (e: Exception) {
            "알 수 없는 위치"
        }
    }

    data class GeocodeResult(
        val address: String,
        val lat: Double,
        val lng: Double
    )

    fun geocode(address: String): List<GeocodeResult> {
        val url = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=$address"

        val headers = HttpHeaders()
        headers.set("x-ncp-apigw-api-key-id", clientId)
        headers.set("x-ncp-apigw-api-key", clientSecret)

        return try {
            val response = restTemplate.exchange(url, HttpMethod.GET, HttpEntity<String>(headers), Map::class.java)
            val body = response.body ?: return emptyList()

            // Parse NCP geocoding response
            // Response structure: { addresses: [{ roadAddress, jibunAddress, x, y }] }
            val addresses = (body["addresses"] as? List<*>) ?: return emptyList()

            addresses.mapNotNull { item ->
                val addr = item as? Map<*, *> ?: return@mapNotNull null
                val roadAddress = addr["roadAddress"] as? String
                val jibunAddress = addr["jibunAddress"] as? String
                val x = (addr["x"] as? String)?.toDoubleOrNull() ?: return@mapNotNull null
                val y = (addr["y"] as? String)?.toDoubleOrNull() ?: return@mapNotNull null

                // Prefer roadAddress over jibunAddress
                val finalAddress = roadAddress?.takeIf { it.isNotBlank() } ?: jibunAddress ?: return@mapNotNull null

                GeocodeResult(
                    address = finalAddress,
                    lat = y,  // Naver uses x=lng, y=lat
                    lng = x
                )
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
