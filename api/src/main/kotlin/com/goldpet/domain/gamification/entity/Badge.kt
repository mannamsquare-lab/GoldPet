package com.goldpet.domain.gamification.entity

import jakarta.persistence.*

@Entity
@Table(name = "badges")
class Badge(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true)
    val code: String,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    val description: String,

    @Column(nullable = false)
    val imageUrl: String
)
