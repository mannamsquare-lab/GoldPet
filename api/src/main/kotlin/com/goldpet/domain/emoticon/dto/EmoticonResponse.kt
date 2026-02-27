package com.goldpet.domain.emoticon.dto

import com.goldpet.domain.emoticon.entity.Emoticon

data class EmoticonResponse(
    val id: Long,
    val name: String?,
    val category: String,
    val imageUrl: String,
    val sortOrder: Int,
    val packId: Long,
    val isActive: Boolean = true
) {
    companion object {
        fun from(emoticon: Emoticon): EmoticonResponse {
            return EmoticonResponse(
                id = emoticon.id,
                name = emoticon.name,
                category = emoticon.pack.name,
                imageUrl = emoticon.imageUrl,
                sortOrder = emoticon.sortOrder,
                packId = emoticon.pack.id,
                isActive = emoticon.isActive
            )
        }
    }
}
