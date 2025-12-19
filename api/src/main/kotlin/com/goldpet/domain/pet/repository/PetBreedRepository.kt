package com.goldpet.domain.pet.repository

import com.goldpet.domain.pet.entity.PetBreed
import org.springframework.data.jpa.repository.JpaRepository

interface PetBreedRepository : JpaRepository<PetBreed, Int>
