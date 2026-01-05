package com.goldpet.domain.common.service

import com.goldpet.domain.common.entity.SystemSetting
import com.goldpet.domain.common.repository.SystemSettingRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class SystemSettingService(
    private val systemSettingRepository: SystemSettingRepository
) {

    @Cacheable("system:settings", key = "#key")
    fun getString(key: String, defaultValue: String): String {
        return systemSettingRepository.findByKey(key)?.value ?: defaultValue
    }

    @Cacheable("system:settings", key = "#key")
    fun getInt(key: String, defaultValue: Int): Int {
        val value = systemSettingRepository.findByKey(key)?.value
        return value?.toIntOrNull() ?: defaultValue
    }

    fun getAllSettings(): List<SystemSetting> {
        return systemSettingRepository.findAll()
    }

    @Transactional
    @CacheEvict("system:settings", key = "#key")
    fun setValue(key: String, value: String, description: String? = null) {
        val setting = systemSettingRepository.findByKey(key) ?: SystemSetting(key = key, value = value, description = description)
        setting.value = value
        if (description != null) {
            setting.description = description
        }
        systemSettingRepository.save(setting)
    }
}
