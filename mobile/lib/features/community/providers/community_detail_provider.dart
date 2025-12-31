import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/community_models.dart';
import '../data/community_repository.dart';

part 'community_detail_provider.g.dart';

@riverpod
Future<CommunityPostModel> postDetail(Ref ref, int postId) {
  return ref.watch(communityRepositoryProvider).getPostDetail(postId);
}

@riverpod
Future<List<CommunityCommentModel>> postComments(Ref ref, int postId) {
  return ref.watch(communityRepositoryProvider).getComments(postId);
}
