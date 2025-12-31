import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../pet/data/pet_model.dart';
import '../providers/home_provider.dart';
import '../../auth/providers/auth_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch data when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(homeProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('GoldPet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              // Manual logout and redirect for testing
              await ref.read(authProvider.notifier).signOut();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(homeProvider.notifier).refresh(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (homeState.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (homeState.error != null)
                Center(child: Text('Error: ${homeState.error}'))
              else
                // The _buildContent expects HomeState.
                // homeState.value is HomeState? (nullable).
                // If we are here, error is null and logic flows.
                // But homeState is AsyncValue<HomeState>.
                // We should unwrap it safely.
                homeState.hasValue
                    ? _buildContent(homeState.value!)
                    : const SizedBox(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(HomeState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (state.pets.isNotEmpty)
          _buildPetCard(state.pets.first)
        else
          _buildEmptyPetCard(),
        const SizedBox(height: 24),
        _buildQuickActions(state.user?.goldBalance ?? 0),
        const SizedBox(height: 24),
        _buildSectionTitle('오늘의 산책'),
        const SizedBox(height: 12),
        _buildWalkSummary(),
        const SizedBox(height: 24),
        _buildSectionTitle('게이미피케이션'),
        const SizedBox(height: 12),
        _buildBadgeSection(),
      ],
    );
  }

  Widget _buildPetCard(PetModel pet) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              image: pet.profileImageUrl != null
                  ? DecorationImage(
                      image: NetworkImage(pet.profileImageUrl!),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: pet.profileImageUrl == null
                ? const Icon(Icons.pets, size: 40, color: AppColors.primary)
                : null,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pet.name,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  // Show breed and age if available. Using birthDate to calculate age is complex here, keeping simpler for now.
                  '${pet.species} • ${pet.breed ?? "믹스"}',
                  style: const TextStyle(fontSize: 14, color: Colors.white70),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.white),
        ],
      ),
    );
  }

  Widget _buildEmptyPetCard() {
    return GestureDetector(
      onTap: () => context.push('/pet/register'),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Row(
          children: [
            Icon(Icons.add_circle_outline, size: 40, color: Colors.grey),
            SizedBox(width: 16),
            Text(
              '반려동물을 등록해주세요',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black54,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(int goldBalance) {
    final actions = [
      (icon: Icons.directions_walk, label: '산책 시작', color: AppColors.success),
      (icon: Icons.photo_camera, label: 'AI 프로필', color: AppColors.info),
      (icon: Icons.location_on, label: '체크인', color: AppColors.warning),
      (
        icon: Icons.monetization_on,
        label: '$goldBalance G',
        color: AppColors.primary,
      ),
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: actions
          .map(
            (action) => _QuickActionItem(
              icon: action.icon,
              label: action.label,
              color: action.color,
              onTap: () {
                if (action.label == '산책 시작') {
                  context.push('/walk');
                } else if (action.label == '체크인') {
                  context.push('/checkin');
                } else if (action.label == 'AI 프로필') {
                  // context.push('/ai-profile'); // To be implemented
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(const SnackBar(content: Text('AI 프로필 준비중')));
                }
              },
            ),
          )
          .toList(),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildWalkSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(value: '0', unit: 'km', label: '거리'),
          _StatItem(value: '0', unit: '분', label: '시간'),
          _StatItem(value: '0', unit: 'kcal', label: '칼로리'),
        ],
      ),
    );
  }

  Widget _buildBadgeSection() {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        itemBuilder: (context, index) => Container(
          width: 80,
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.emoji_events, color: AppColors.primary, size: 32),
              SizedBox(height: 4),
              Text('준비중', style: TextStyle(fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _QuickActionItem({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String unit;
  final String label;

  const _StatItem({
    required this.value,
    required this.unit,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        RichText(
          text: TextSpan(
            style: const TextStyle(color: AppColors.textPrimary),
            children: [
              TextSpan(
                text: value,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextSpan(text: ' $unit', style: const TextStyle(fontSize: 14)),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
