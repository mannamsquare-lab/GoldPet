package com.goldpet.domain.pet.repository

import com.goldpet.domain.pet.entity.Pet
import org.springframework.data.jpa.repository.JpaRepository

interface PetRepository : JpaRepository<Pet, Long> {
    fun findByOwnerId(userId: Long): List<Pet>
    fun findAllByOwnerId(userId: Long): List<Pet>
    fun countByOwnerId(userId: Long): Long
    fun findFirstByOwnerIdOrderByCreatedAtAsc(ownerId: Long): Pet?
}

