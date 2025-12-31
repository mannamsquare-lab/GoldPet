import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(authProvider, (previous, next) {
      if (next is AsyncError) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('로그인 실패: ${next.error}')));
      } else if (next is AsyncData && next.value == null) {
        if (!next.isLoading && !next.hasError) {
          context.go('/');
        }
      }
    });

    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Spacer(),
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: const Icon(
                      Icons.pets,
                      size: 50,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'GoldPet',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '반려동물과의 모든 순간을 기록하세요',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const Spacer(),
                  _SocialLoginButton(
                    icon: Icons.g_mobiledata,
                    label: 'Google로 계속하기',
                    color: Colors.white,
                    textColor: Colors.black87,
                    onTap: () =>
                        ref.read(authProvider.notifier).signInWithGoogle(),
                  ),
                  const SizedBox(height: 12),
                  _SocialLoginButton(
                    icon: Icons.apple,
                    label: 'Apple로 계속하기',
                    color: Colors.black,
                    textColor: Colors.white,
                    onTap: () =>
                        ref.read(authProvider.notifier).signInWithApple(),
                  ),
                  const SizedBox(height: 12),
                  _SocialLoginButton(
                    icon: Icons.chat_bubble,
                    label: '카카오로 계속하기',
                    color: const Color(0xFFFEE500),
                    textColor: Colors.black87,
                    onTap: () =>
                        ref.read(authProvider.notifier).signInWithKakao(),
                  ),
                  const SizedBox(height: 12),
                  _SocialLoginButton(
                    iconWidget: const Text(
                      'N',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'serif', // Naver-like font
                      ),
                    ),
                    label: '네이버로 계속하기',
                    color: const Color(0xFF03C75A),
                    textColor: Colors.white,
                    onTap: () =>
                        ref.read(authProvider.notifier).signInWithNaver(),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    '계속 진행하면 이용약관 및 개인정보처리방침에 동의하게 됩니다.',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            if (authState.isLoading)
              Container(
                color: Colors.black26,
                child: const Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }
}

class _SocialLoginButton extends StatelessWidget {
  final IconData? icon;
  final Widget? iconWidget;
  final String label;
  final Color color;
  final Color textColor;
  final VoidCallback onTap;

  const _SocialLoginButton({
    this.icon,
    this.iconWidget,
    required this.label,
    required this.color,
    required this.textColor,
    required this.onTap,
  }) : assert(icon != null || iconWidget != null);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
          border: color == Colors.white
              ? Border.all(color: AppColors.border)
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null)
              Icon(icon, color: textColor, size: 24)
            else if (iconWidget != null)
              iconWidget!,
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
