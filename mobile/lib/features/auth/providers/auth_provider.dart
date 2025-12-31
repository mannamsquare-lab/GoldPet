import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_repository.dart';

part 'auth_provider.g.dart';

@riverpod
class Auth extends _$Auth {
  @override
  FutureOr<void> build() {
    return null;
  }

  Future<bool> checkAuth() async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final token = await repository.getAccessToken();
      state = const AsyncValue.data(null);
      return token != null;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    final repository = ref.read(authRepositoryProvider);
    state = await AsyncValue.guard(() => repository.signInWithGoogle());
  }

  Future<void> signInWithApple() async {
    state = const AsyncValue.loading();
    final repository = ref.read(authRepositoryProvider);
    state = await AsyncValue.guard(() => repository.signInWithApple());
  }

  Future<void> signInWithKakao() async {
    state = const AsyncValue.loading();
    final repository = ref.read(authRepositoryProvider);
    state = await AsyncValue.guard(() => repository.signInWithKakao());
  }

  Future<void> signInWithNaver() async {
    state = const AsyncValue.loading();
    final repository = ref.read(authRepositoryProvider);
    state = await AsyncValue.guard(() => repository.signInWithNaver());
  }

  Future<void> signOut() async {
    state = const AsyncValue.loading();
    final repository = ref.read(authRepositoryProvider);
    state = await AsyncValue.guard(() => repository.signOut());
  }
}
