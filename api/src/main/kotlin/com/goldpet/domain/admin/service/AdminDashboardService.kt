package com.goldpet.domain.admin.service

import com.goldpet.domain.admin.controller.ChartDataPoint
import com.goldpet.domain.admin.controller.DashboardChartsResponse
import com.goldpet.domain.admin.controller.DashboardStatsResponse
import com.goldpet.domain.admin.controller.RecentActivityItem
import com.goldpet.domain.community.repository.CommunityCommentRepository
import com.goldpet.domain.community.repository.CommunityPostRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class AdminDashboardService(
    private val userRepository: UserRepository,
    private val petRepository: PetRepository,
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository
) {

    fun getStats(): DashboardStatsResponse {
        val today = LocalDate.now()
        val startOfToday = today.atStartOfDay()
        val startOfWeek = today.minusDays(7).atStartOfDay()

        val totalUsers = userRepository.count()
        val newUsersToday = userRepository.countByCreatedAtAfter(startOfToday)
        val newUsersThisWeek = userRepository.countByCreatedAtAfter(startOfWeek)
        val totalPets = petRepository.count()
        
        val totalPosts = postRepository.count()
        val totalComments = commentRepository.count()

        return DashboardStatsResponse(
            totalUsers = totalUsers,
            newUsersToday = newUsersToday,
            newUsersThisWeek = newUsersThisWeek,
            totalPets = totalPets,
            totalWalks = 0L,
            totalDistance = 0.0,
            totalPosts = totalPosts,
            totalComments = totalComments,
            totalReports = 0,
            pendingReports = 0,
            revenue = 0L,
            goldCirculation = 0L
        )
    }

    fun getCharts(days: Int): DashboardChartsResponse {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val today = LocalDate.now()
        
        val userGrowth = (0 until days).map { i ->
            val date = today.minusDays(i.toLong())
            ChartDataPoint(
                date = date.format(formatter),
                value = (100..200).random().toLong()
            )
        }.reversed()

        val walkActivity = (0 until days).map { i ->
            val date = today.minusDays(i.toLong())
            ChartDataPoint(
                date = date.format(formatter),
                value = (50..150).random().toLong()
            )
        }.reversed()

        val revenue = (0 until days).map { i ->
            val date = today.minusDays(i.toLong())
            ChartDataPoint(
                date = date.format(formatter),
                value = (1000..5000).random().toLong()
            )
        }.reversed()

        return DashboardChartsResponse(
            userGrowth = userGrowth,
            walkActivity = walkActivity,
            revenue = revenue
        )
    }

    fun getRecentActivity(limit: Int): List<RecentActivityItem> {
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
        val activities = mutableListOf<RecentActivityItem>()
        
        userRepository.findAll().take(limit / 3).forEach { user ->
            activities.add(RecentActivityItem(
                id = user.id,
                type = "USER_JOIN",
                description = "${user.nickname ?: "사용자"}님이 가입했습니다.",
                createdAt = user.createdAt.format(formatter)
            ))
        }

        postRepository.findAll().take(limit / 3).forEach { post ->
            activities.add(RecentActivityItem(
                id = post.id,
                type = "POST_CREATE",
                description = "\"${post.title}\" 게시글이 작성되었습니다.",
                createdAt = post.createdAt.format(formatter)
            ))
        }

        return activities.sortedByDescending { it.createdAt }.take(limit)
    }
}
