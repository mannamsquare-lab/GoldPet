import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import apiClient from '../api/client'
import { notificationService } from '../notificationService'

const mockedClient = vi.mocked(apiClient)

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('returns notifications and hasMore from paginated response', async () => {
      const mockData = {
        content: [{ id: 1, type: 'MESSAGE', title: '새 메시지', message: '메시지가 왔습니다.', isRead: false, createdAt: '2024-01-01' }],
        last: false,
      }
      mockedClient.get.mockResolvedValueOnce({ data: mockData })

      const result = await notificationService.getNotifications('ALL', 0, 20)

      expect(mockedClient.get).toHaveBeenCalledWith('/notifications?category=ALL&page=0&size=20')
      expect(result.notifications).toHaveLength(1)
      expect(result.hasMore).toBe(true)
    })

    it('returns empty array on error', async () => {
      mockedClient.get.mockRejectedValueOnce(new Error('network error'))

      const result = await notificationService.getNotifications()

      expect(result.notifications).toEqual([])
      expect(result.hasMore).toBe(false)
    })
  })

  describe('getUnreadCount', () => {
    it('returns unread count from API', async () => {
      mockedClient.get.mockResolvedValueOnce({ data: { count: 5 } })

      const count = await notificationService.getUnreadCount()

      expect(mockedClient.get).toHaveBeenCalledWith('/notifications/unread-count')
      expect(count).toBe(5)
    })

    it('returns 0 on error', async () => {
      mockedClient.get.mockRejectedValueOnce(new Error('error'))

      const count = await notificationService.getUnreadCount()

      expect(count).toBe(0)
    })
  })

  describe('markAsRead', () => {
    it('posts to read endpoint for given notification id', async () => {
      mockedClient.post.mockResolvedValueOnce({ data: {} })

      await notificationService.markAsRead(42)

      expect(mockedClient.post).toHaveBeenCalledWith('/notifications/42/read')
    })

    it('silently ignores errors', async () => {
      mockedClient.post.mockRejectedValueOnce(new Error('error'))

      await expect(notificationService.markAsRead(1)).resolves.toBeUndefined()
    })
  })

  describe('markAllAsRead', () => {
    it('posts to read-all endpoint', async () => {
      mockedClient.post.mockResolvedValueOnce({ data: {} })

      await notificationService.markAllAsRead()

      expect(mockedClient.post).toHaveBeenCalledWith('/notifications/read-all')
    })
  })

  describe('deleteNotification', () => {
    it('deletes notification by id', async () => {
      mockedClient.delete.mockResolvedValueOnce({ data: {} })

      await notificationService.deleteNotification(7)

      expect(mockedClient.delete).toHaveBeenCalledWith('/notifications/7')
    })

    it('throws on delete failure', async () => {
      mockedClient.delete.mockRejectedValueOnce(new Error('error'))

      await expect(notificationService.deleteNotification(7)).rejects.toThrow('알림 삭제에 실패했습니다.')
    })
  })
})
