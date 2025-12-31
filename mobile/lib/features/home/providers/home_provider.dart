import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../user/data/user_model.dart';
import '../../pet/data/pet_model.dart';
import '../data/home_repository.dart';

part 'home_provider.g.dart';

class HomeState {
  final UserModel? user;
  final List<PetModel> pets;

  const HomeState({this.user, this.pets = const []});

  HomeState copyWith({UserModel? user, List<PetModel>? pets}) {
    return HomeState(user: user ?? this.user, pets: pets ?? this.pets);
  }
}

@riverpod
class Home extends _$Home {
  @override
  Future<HomeState> build() async {
    // Initial load: start fetching but return empty state immediately (or loading)
    // Actually for AsyncNotifier, build() should return the initial data associated with the provider.
    // To support progressive loading, we can return a default state and trigger loading.

    // We defer the actual loading to a separate method or execute it here without awaiting both blocking.
    _loadData(); // Fire and forget

    return const HomeState();
  }

  Future<void> _loadData() async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(homeRepositoryProvider);

      // We start with a base state (empty or current state value)
      // Since we just set loading, the previous value is available in `state.valueOrNull` if we wanted to keep it.
      // But typically for pull-to-refresh we want to refresh.

      var currentState = const HomeState();

      // Launch both requests
      final profileFuture = repository.getMyProfile();
      final petsFuture = repository.getMyPets();

      // Wait for the first one (Profile is usually faster and more critical for greeting)
      final profile = await profileFuture;
      currentState = currentState.copyWith(user: profile);
      state = AsyncValue.data(currentState);

      // Then wait for pets (or if they finished already)
      final pets = await petsFuture;
      currentState = currentState.copyWith(pets: pets);
      state = AsyncValue.data(currentState);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    await _loadData();
  }
}
