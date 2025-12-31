package com.goldpet.domain.pet.dto

import com.goldpet.domain.pet.entity.PetBreed
import com.goldpet.domain.pet.entity.PetSpecies

data class SpeciesResponse(
    val id: Int,
    val code: String,
    val name: String
) {
    companion object {
        fun from(entity: PetSpecies) = SpeciesResponse(
            id = entity.id,
            code = entity.code,
            name = entity.name
        )
    }
}

data class BreedResponse(
    val id: Int,
    val speciesId: Int,
    val name: String
) {
    companion object {
        fun from(entity: PetBreed) = BreedResponse(
            id = entity.id,
            speciesId = entity.petSpecies.id,
            name = entity.name
        )
    }
}
