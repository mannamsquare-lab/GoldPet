import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/community_models.dart';
import '../data/community_repository.dart';

part 'community_list_provider.g.dart';

@riverpod
Future<List<CommunityCategoryModel>> communityCategories(Ref ref) {
  return ref.watch(communityRepositoryProvider).getCategories();
}

@riverpod
class CommunityList extends _$CommunityList {
  int? _currentCategoryId;

  @override
  FutureOr<List<CommunityPostModel>> build() async {
    return _fetchPosts();
  }

  Future<List<CommunityPostModel>> _fetchPosts({int page = 0}) async {
    final repository = ref.read(communityRepositoryProvider);
    return repository.getPosts(page: page, categoryId: _currentCategoryId);
  }

  Future<void> setCategory(int? categoryId) async {
    _currentCategoryId = categoryId;
    await refresh();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchPosts());
  }

  Future<void> loadMore() async {
    // Implement pagination logic here if needed
  }

  void updatePost(CommunityPostModel updatedPost) {
    state = state.whenData((posts) {
      return posts
          .map((p) => p.id == updatedPost.id ? updatedPost : p)
          .toList();
    });
  }

  int? get currentCategoryId => _currentCategoryId;
}
