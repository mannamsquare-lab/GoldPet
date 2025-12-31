import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'community_models.dart';

final communityRepositoryProvider = Provider<CommunityRepository>((ref) {
  return CommunityRepository(ref.read(apiClientProvider));
});

class CommunityRepository {
  final ApiClient _apiClient;

  CommunityRepository(this._apiClient);

  Future<List<CommunityPostModel>> getPosts({
    int page = 0,
    int size = 20,
    int? categoryId,
    String? keyword,
  }) async {
    final path = keyword != null
        ? '/api/v1/community/posts/search'
        : '/api/v1/community/posts';
    final params = {
      'page': page,
      'size': size,
      if (categoryId != null) 'categoryId': categoryId,
      if (keyword != null) 'keyword': keyword,
    };

    final response = await _apiClient.get(path, queryParameters: params);

    // Check if response.data is Page object or List
    // Spring Page: { content: [], number: 0, ... }
    final data = response.data;
    List listData = [];
    if (data is Map && data.containsKey('content')) {
      listData = data['content'];
    } else if (data is List) {
      listData = data;
    }

    return listData.map((e) => CommunityPostModel.fromJson(e)).toList();
  }

  Future<CommunityPostModel> getPostDetail(int id) async {
    final response = await _apiClient.get('/api/v1/community/posts/$id');
    return CommunityPostModel.fromJson(response.data);
  }

  Future<List<CommunityCategoryModel>> getCategories() async {
    final response = await _apiClient.get('/api/v1/community/categories');
    final list = response.data as List;
    return list.map((e) => CommunityCategoryModel.fromJson(e)).toList();
  }

  Future<CommunityPostModel> createPost(CreatePostRequest request) async {
    final response = await _apiClient.post(
      '/api/v1/community/posts',
      data: request.toJson(),
    );
    return CommunityPostModel.fromJson(response.data);
  }

  Future<void> deletePost(int id) async {
    await _apiClient.delete('/api/v1/community/posts/$id');
  }

  Future<bool> likePost(int id) async {
    final response = await _apiClient.post('/api/v1/community/posts/$id/like');
    return response.data as bool;
  }

  Future<List<CommunityCommentModel>> getComments(
    int postId, {
    int page = 0,
    int size = 50,
  }) async {
    final response = await _apiClient.get(
      '/api/v1/community/posts/$postId/comments',
      queryParameters: {'page': page, 'size': size},
    );

    final data = response.data;
    List listData = [];
    if (data is Map && data.containsKey('content')) {
      listData = data['content'];
    } else if (data is List) {
      listData = data;
    }
    return listData.map((e) => CommunityCommentModel.fromJson(e)).toList();
  }

  Future<CommunityCommentModel> createComment(
    int postId,
    CreateCommentRequest request,
  ) async {
    final response = await _apiClient.post(
      '/api/v1/community/posts/$postId/comments',
      data: request.toJson(),
    );
    return CommunityCommentModel.fromJson(response.data);
  }

  Future<String> uploadFile(String filePath) async {
    final fileName = filePath.split('/').last;
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });

    final response = await _apiClient.post('/api/v1/files', data: formData);

    // server returns { "url": "..." }
    return response.data['url'] as String;
  }
}
