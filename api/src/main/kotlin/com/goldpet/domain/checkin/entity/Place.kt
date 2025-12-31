package com.goldpet.domain.checkin.entity

import com.goldpet.domain.common.entity.BaseTimeEntity
import jakarta.persistence.*
import org.locationtech.jts.geom.Point

enum class PlaceCategory {
    PARK,           // 공원
    CAFE,           // 펫 카페
    RESTAURANT,     // 펫 레스토랑
    HOSPITAL,       // 동물병원
    SHOP,           // 펫샵
    PLAYGROUND,     // 놀이터
    TRAIL,          // 산책로
    OTHER           // 기타
}

@Entity
@Table(name = "places")
class Place(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val category: PlaceCategory,

    @Column(name = "address")
    val address: String? = null,

    @Column(columnDefinition = "geometry(Point, 4326)", nullable = false)
    val locationGeom: Point,

    @Column(name = "description")
    val description: String? = null,

    @Column(name = "image_url")
    val imageUrl: String? = null,

    @Column(name = "is_verified", nullable = false)
    var isVerified: Boolean = false,

    @Column(name = "checkin_count", nullable = false)
    var checkinCount: Int = 0

) : BaseTimeEntity()
