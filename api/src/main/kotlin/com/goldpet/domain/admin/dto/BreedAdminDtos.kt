package com.goldpet.domain.admin.dto

data class CreateBreedRequest(
    val speciesId: Int,
    val name: String,
    val category: String? = null,
    val description: String? = null
)

data class UpdateBreedRequest(
    val name: String,
    val category: String? = null,
    val description: String? = null
)
