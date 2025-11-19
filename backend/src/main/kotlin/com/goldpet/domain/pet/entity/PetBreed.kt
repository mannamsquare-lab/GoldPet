package com.goldpet.domain.pet.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "pet_breeds")
class PetBreed(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id", nullable = false)
    val petSpecies: PetSpecies,

    @Column(nullable = false)
    val name: String,

    val description: String?,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
