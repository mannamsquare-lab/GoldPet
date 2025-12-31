package com.goldpet.domain.checkin.repository

import com.goldpet.domain.checkin.entity.Place
import com.goldpet.domain.checkin.entity.PlaceCategory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PlaceRepository : JpaRepository<Place, Long> {
    fun findByCategory(category: PlaceCategory, pageable: Pageable): Page<Place>
    
    @Query(value = """
        SELECT * FROM places p 
        WHERE ST_DWithin(p.location_geom, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography, :radiusMeters)
        ORDER BY ST_Distance(p.location_geom, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography)
    """, nativeQuery = true)
    fun findNearbyPlaces(
        @Param("lat") latitude: Double,
        @Param("lng") longitude: Double,
        @Param("radiusMeters") radiusMeters: Double
    ): List<Place>
    
    fun findByNameContainingIgnoreCase(name: String, pageable: Pageable): Page<Place>
}
