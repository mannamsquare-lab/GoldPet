package com.goldpet.infra.naver

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.client.SimpleClientHttpRequestFactory

@Service
class NaverGeocodingService(
    @Value("\${ncp.maps.client-id:}") private val clientId: String,
    @Value("\${ncp.maps.client-secret:}") private val clientSecret: String
) {
    private val log = LoggerFactory.getLogger(NaverGeocodingService::class.java)
    private val restTemplate = RestTemplate(SimpleClientHttpRequestFactory().apply {
        setConnectTimeout(3000)
        setReadTimeout(3000)
    })

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

            val result = listOf(area1, area2, area3).filter { it.isNotBlank() }.joinToString(" ").ifBlank { "알 수 없는 위치" }
            log.debug("Reverse geocode ({},{}) = '{}'", lat, lng, result)
            result
        } catch (e: Exception) {
            log.warn("Reverse geocoding failed for lat={}, lng={}: {}", lat, lng, e.message)
            "알 수 없는 위치"
        }
    }

    data class ReverseGeocodeResult(
        val fullAddress: String,
        val province: String?,
        val district: String? = null
    )

    fun reverseGeocodeStructured(lat: Double, lng: Double): ReverseGeocodeResult {
        val url = "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=$lng,$lat&output=json&orders=legalcode"

        val headers = HttpHeaders()
        headers.set("x-ncp-apigw-api-key-id", clientId)
        headers.set("x-ncp-apigw-api-key", clientSecret)

        return try {
            val response = restTemplate.exchange(url, HttpMethod.GET, HttpEntity<String>(headers), Map::class.java)
            val body = response.body ?: return ReverseGeocodeResult("알 수 없는 위치", null)

            val results = (body["results"] as? List<*>)?.firstOrNull() as? Map<*, *>
            val region = results?.get("region") as? Map<*, *>
            val area1 = (region?.get("area1") as? Map<*, *>)?.get("name") as? String ?: ""
            val area2 = (region?.get("area2") as? Map<*, *>)?.get("name") as? String ?: ""
            val area3 = (region?.get("area3") as? Map<*, *>)?.get("name") as? String ?: ""

            val fullAddress = listOf(area1, area2, area3).filter { it.isNotBlank() }.joinToString(" ").ifBlank { "알 수 없는 위치" }
            val province = abbreviateProvince(area1)
            log.debug("Reverse geocode structured ({},{}) = '{}', province='{}'", lat, lng, fullAddress, province)
            ReverseGeocodeResult(fullAddress, province)
        } catch (e: Exception) {
            log.warn("Structured reverse geocoding failed for lat={}, lng={}: {}", lat, lng, e.message)
            ReverseGeocodeResult("알 수 없는 위치", null)
        }
    }

    companion object {
        private val PROVINCE_MAP = mapOf(
            "서울특별시" to "서울",
            "경기도" to "경기",
            "강원도" to "강원",
            "강원특별자치도" to "강원",
            "경상북도" to "경북",
            "경상남도" to "경남",
            "광주광역시" to "광주",
            "대구광역시" to "대구",
            "대전광역시" to "대전",
            "부산광역시" to "부산",
            "세종특별자치시" to "세종",
            "울산광역시" to "울산",
            "인천광역시" to "인천",
            "전라남도" to "전남",
            "전라북도" to "전북",
            "전북특별자치도" to "전북",
            "제주특별자치도" to "제주",
            "충청남도" to "충남",
            "충청북도" to "충북",
        )

        fun abbreviateProvince(area1: String): String? {
            return PROVINCE_MAP[area1]
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
            val addresses = (body["addresses"] as? List<*>) ?: run {
                log.warn("Geocoding returned no addresses field for query: {}", address)
                return emptyList()
            }
            if (addresses.isEmpty()) {
                log.warn("Geocoding returned empty results for query: {}", address)
                return emptyList()
            }

            val result = addresses.mapNotNull { item ->
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
            log.debug("Geocode '{}' returned {} results", address, result.size)
            result
        } catch (e: Exception) {
            log.error("Geocoding failed for query '{}': {}", address, e.message)
            emptyList()
        }
    }
}
