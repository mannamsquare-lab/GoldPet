package com.goldpet.domain.pet.dto

import com.goldpet.domain.pet.entity.Pet
import java.time.LocalDate

data class CreatePetRequest(
    val name: String,
    val speciesId: Int,
    val breedId: Int?,
    val gender: String?,
    val birthDate: LocalDate?,
    val weightKg: Double?,
    val isNeutered: Boolean?,
    val profileImageUrl: String?,
    val temperamentTags: String?,
)

data class UpdatePetRequest(
    val name: String?,
    val speciesId: Int?,
    val breedId: Int?,
    val gender: String?,
    val birthDate: LocalDate?,
    val weightKg: Double?,
    val isNeutered: Boolean?,
    val profileImageUrl: String?,
    val temperamentTags: String?,
)

data class PetResponse(
    val id: Long,
    val ownerId: Long,
    val name: String,
    val species: String,
    val breed: String?,
    val gender: String?,
    val birthDate: LocalDate?,
    val weightKg: Double?,
    val isNeutered: Boolean?,
    val profileImageUrl: String?,
    val temperamentTags: List<String>,
) {
    companion object {
        fun from(pet: Pet): PetResponse {
            return PetResponse(
                id = pet.id,
                ownerId = pet.owner.id,
                name = pet.name,
                species = pet.species.name,
                breed = pet.breed?.name,
                gender = pet.gender,
                birthDate = pet.birthDate,
                weightKg = pet.weightKg,
                isNeutered = pet.isNeutered,
                profileImageUrl = pet.profileImageUrl,
                temperamentTags = pet.temperamentTags?.split(",") ?: emptyList()
            )
        }
    }
}

data class SimplePetResponse(
    val id: Long,
    val name: String,
    val profileImageUrl: String?,
) {
    companion object {
        fun from(pet: Pet): SimplePetResponse {
            return SimplePetResponse(
                id = pet.id,
                name = pet.name,
                profileImageUrl = pet.profileImageUrl
            )
        }
    }
}
