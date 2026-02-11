package com.goldpet.domain.friend.repository

import com.goldpet.domain.user.entity.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface FriendRepository : JpaRepository<User, Long> {
    // Find users within distance, ordered by registration (created_at DESC)
    @Query(value = """
        SELECT u.*
        FROM users u
        WHERE u.id != :myUserId
        AND u.is_active = true
        AND EXISTS (SELECT 1 FROM pets p WHERE p.owner_user_id = u.id)
        AND ST_DWithin(
            u.main_location_geom,
            ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326),
            :radiusMeters
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes l
            WHERE l.from_user_id = :myUserId
            AND l.to_user_id = u.id
            AND l.status = 'ACTIVE'
        )
        ORDER BY u.created_at DESC
    """, countQuery = """
        SELECT count(DISTINCT u.id) 
        FROM users u
        INNER JOIN pets p ON u.id = p.owner_user_id
        WHERE u.id != :myUserId
        AND u.is_active = true
        AND ST_DWithin(
            u.main_location_geom, 
            ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326), 
            :radiusMeters
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes l 
            WHERE l.from_user_id = :myUserId 
            AND l.to_user_id = u.id 
            AND l.status = 'ACTIVE'
        )
    """, nativeQuery = true)
    fun findFriendsNearbyByRegistered(
        @Param("myUserId") myUserId: Long,
        @Param("myLat") myLat: Double,
        @Param("myLng") myLng: Double,
        @Param("radiusMeters") radiusMeters: Double,
        pageable: Pageable
    ): Page<User>

    // Find users within distance, ordered by likes count (popularity)
    @Query(value = """
        SELECT u.*, COUNT(l2.id) AS like_count
        FROM users u
        INNER JOIN pets p ON u.id = p.owner_user_id
        LEFT JOIN likes l2 ON u.id = l2.to_user_id AND l2.status = 'ACTIVE'
        WHERE u.id != :myUserId
        AND u.is_active = true
        AND ST_DWithin(
            u.main_location_geom,
            ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326),
            :radiusMeters
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes l
            WHERE l.from_user_id = :myUserId
            AND l.to_user_id = u.id
            AND l.status = 'ACTIVE'
        )
        GROUP BY u.id
        ORDER BY like_count DESC, u.created_at DESC
    """, countQuery = """
        SELECT count(DISTINCT u.id) 
        FROM users u
        INNER JOIN pets p ON u.id = p.owner_user_id
        WHERE u.id != :myUserId
        AND u.is_active = true
        AND ST_DWithin(
            u.main_location_geom, 
            ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326), 
            :radiusMeters
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes l 
            WHERE l.from_user_id = :myUserId 
            AND l.to_user_id = u.id 
            AND l.status = 'ACTIVE'
        )
    """, nativeQuery = true)
    fun findFriendsNearbyByPopular(
        @Param("myUserId") myUserId: Long,
        @Param("myLat") myLat: Double,
        @Param("myLng") myLng: Double,
        @Param("radiusMeters") radiusMeters: Double,
        pageable: Pageable
    ): Page<User>

    // Find users within distance, ordered by distance (closest first)
    @Query(value = """
        SELECT u.*, ST_Distance(u.main_location_geom, ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326)) AS dist
        FROM users u
        INNER JOIN pets p ON u.id = p.owner_user_id
        WHERE u.id != :myUserId
        AND u.is_active = true
        AND ST_DWithin(
            u.main_location_geom,
            ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326),
            :radiusMeters
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes l
            WHERE l.from_user_id = :myUserId
            AND l.to_user_id = u.id
            AND l.status = 'ACTIVE'
        )
        GROUP BY u.id
        ORDER BY dist ASC
    """, countQuery = """
        SELECT count(DISTINCT u.id) 
        FROM users u
        INNER JOIN pets p ON u.id = p.owner_user_id
        WHERE u.id != :myUserId
        AND u.is_active = true
        AND ST_DWithin(
            u.main_location_geom, 
            ST_SetSRID(ST_MakePoint(:myLng, :myLat), 4326), 
            :radiusMeters
        )
        AND NOT EXISTS (
            SELECT 1 FROM likes l 
            WHERE l.from_user_id = :myUserId 
            AND l.to_user_id = u.id 
            AND l.status = 'ACTIVE'
        )
    """, nativeQuery = true)
    fun findFriendsNearbyByDistance(
        @Param("myUserId") myUserId: Long,
        @Param("myLat") myLat: Double,
        @Param("myLng") myLng: Double,
        @Param("radiusMeters") radiusMeters: Double,
        pageable: Pageable
    ): Page<User>
}
