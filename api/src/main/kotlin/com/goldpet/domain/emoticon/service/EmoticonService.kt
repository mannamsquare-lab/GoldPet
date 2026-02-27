package com.goldpet.domain.emoticon.service

import com.goldpet.domain.emoticon.dto.EmoticonResponse
import com.goldpet.domain.emoticon.entity.Emoticon
import com.goldpet.domain.emoticon.repository.EmoticonRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class EmoticonService(
    private val emoticonRepository: EmoticonRepository
) {
    @Cacheable("emoticons")
    fun getActiveEmoticons(): List<EmoticonResponse> {
        return emoticonRepository.findAllByIsActiveTrueOrderBySortOrder()
            .map { EmoticonResponse.from(it) }
    }

    fun getById(id: Long): Emoticon? {
        return emoticonRepository.findById(id).orElse(null)
    }

    fun getByIds(ids: List<Long>): Map<Long, Emoticon> {
        if (ids.isEmpty()) return emptyMap()
        return emoticonRepository.findAllByIdIn(ids).associateBy { it.id }
    }
}
