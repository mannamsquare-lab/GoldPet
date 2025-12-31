import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../home/providers/home_provider.dart';
import '../../gold/providers/gold_providers.dart';
import '../../pet/data/pet_model.dart';
import '../data/ai_models.dart';
import '../providers/ai_providers.dart';
import '../../../shared/data/file_repository.dart';

class AIProfileScreen extends ConsumerWidget {
  const AIProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('AI 펫 프로필'),
          bottom: const TabBar(
            tabs: [
              Tab(text: '새로 만들기'),
              Tab(text: '내 갤러리'),
            ],
          ),
        ),
        body: const TabBarView(children: [_CreateTab(), _GalleryTab()]),
      ),
    );
  }
}

class _CreateTab extends ConsumerStatefulWidget {
  const _CreateTab();

  @override
  ConsumerState<_CreateTab> createState() => _CreateTabState();
}

class _CreateTabState extends ConsumerState<_CreateTab> {
  PetModel? _selectedPet;
  AIStyleOption? _selectedStyle;
  File? _selectedImage;
  bool _isUploading = false;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery);
    if (picked != null) {
      setState(() {
        _selectedImage = File(picked.path);
      });
    }
  }

  Future<void> _submit() async {
    if (_selectedPet == null ||
        _selectedStyle == null ||
        _selectedImage == null)
      return;

    // Check Gold
    final balance = await ref.read(goldBalanceProvider.future);
    if (balance.balance < _selectedStyle!.goldCost) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('골드 부족'),
            content: Text('골드가 부족합니다. (필요: ${_selectedStyle!.goldCost} G)'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('확인'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.push('/gold');
                },
                child: const Text('충전하러 가기'),
              ),
            ],
          ),
        );
      }
      return;
    }

    setState(() => _isUploading = true);

    try {
      // 1. Upload File
      final url = await ref
          .read(fileRepositoryProvider)
          .uploadFile(_selectedImage!);

      // 2. Create Request
      await ref
          .read(aiControllerProvider.notifier)
          .createRequest(
            petId: _selectedPet!.id,
            type: AIRequestType.IMAGE,
            sourceImageUrl: url,
            stylePrompt: _selectedStyle!.id,
          );

      // 3. Reset & Notify
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('AI 프로필 생성이 요청되었습니다. 갤러리에서 확인하세요.')),
        );
        setState(() {
          _selectedImage = null;
          _selectedStyle = null; // optional reset
          _isUploading = false;
        });
        DefaultTabController.of(context).animateTo(1); // Switch to gallery
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $e')));
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider).valueOrNull;
    final pets = homeState?.pets ?? [];
    final stylesAsync = ref.watch(aiStylesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Select Pet
          const Text(
            '1. 주인공 선택',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          if (pets.isEmpty)
            const Text('등록된 펫이 없습니다. 먼저 펫을 등록해주세요.')
          else
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: pets.length,
                itemBuilder: (context, index) {
                  final pet = pets[index];
                  final isSelected = _selectedPet?.id == pet.id;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedPet = pet),
                    child: Container(
                      margin: const EdgeInsets.only(right: 12),
                      width: 80,
                      decoration: BoxDecoration(
                        border: isSelected
                            ? Border.all(color: AppColors.primary, width: 2)
                            : null,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundImage: pet.profileImageUrl != null
                                ? NetworkImage(pet.profileImageUrl!)
                                : null,
                            child: pet.profileImageUrl == null
                                ? const Icon(Icons.pets)
                                : null,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            pet.name,
                            style: TextStyle(
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

          const SizedBox(height: 24),

          // 2. Upload Photo
          const Text(
            '2. 사진 업로드',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(12),
                image: _selectedImage != null
                    ? DecorationImage(
                        image: FileImage(_selectedImage!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: _selectedImage == null
                  ? const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_a_photo, size: 40, color: Colors.grey),
                        SizedBox(height: 8),
                        Text('얼굴이 잘 나온 사진을 올려주세요'),
                      ],
                    )
                  : null,
            ),
          ),

          const SizedBox(height: 24),

          // 3. Select Style
          const Text(
            '3. 스타일 선택',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          stylesAsync.when(
            data: (styles) => GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.2,
              ),
              itemCount: styles.length,
              itemBuilder: (context, index) {
                final style = styles[index];
                final isSelected = _selectedStyle?.id == style.id;
                return GestureDetector(
                  onTap: () => setState(() => _selectedStyle = style),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: isSelected
                          ? Border.all(color: AppColors.primary, width: 2)
                          : Border.all(color: Colors.grey[300]!),
                      image: DecorationImage(
                        image: NetworkImage(style.previewUrl),
                        fit: BoxFit.cover,
                        colorFilter: isSelected
                            ? null
                            : ColorFilter.mode(
                                Colors.black.withOpacity(0.4),
                                BlendMode.darken,
                              ),
                      ),
                    ),
                    child: Stack(
                      children: [
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.6),
                              borderRadius: const BorderRadius.vertical(
                                bottom: Radius.circular(10),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  style.name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '${style.goldCost} G',
                                  style: const TextStyle(
                                    color: Colors.amber,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (isSelected)
                          Positioned(
                            top: 8,
                            right: 8,
                            child: CircleAvatar(
                              radius: 12,
                              backgroundColor: AppColors.primary,
                              child: const Icon(
                                Icons.check,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error: $e'),
          ),

          const SizedBox(height: 32),

          // Submit
          ElevatedButton(
            onPressed:
                (_isUploading ||
                    _selectedPet == null ||
                    _selectedImage == null ||
                    _selectedStyle == null)
                ? null
                : _submit,
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 56),
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: _isUploading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(color: Colors.white),
                  )
                : const Text(
                    '생성하기',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _GalleryTab extends ConsumerWidget {
  const _GalleryTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(aiRequestsProvider);

    return requestsAsync.when(
      data: (requests) {
        if (requests.isEmpty) {
          return const Center(child: Text('생성된 프로필이 없습니다.'));
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: requests.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final req = requests[index];
            return Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  if (req.status == AIRequestStatus.COMPLETED &&
                      req.resultUrl != null)
                    Image.network(
                      req.resultUrl!,
                      width: double.infinity,
                      height: 250,
                      fit: BoxFit.cover,
                    )
                  else if (req.status == AIRequestStatus.FAILED)
                    Container(
                      height: 250,
                      color: Colors.grey[200],
                      alignment: Alignment.center,
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.error, color: Colors.red, size: 40),
                          SizedBox(height: 8),
                          Text('생성 실패'),
                        ],
                      ),
                    )
                  else
                    Container(
                      height: 250,
                      color: Colors.grey[200],
                      alignment: Alignment.center,
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 8),
                          Text('생성 중...'),
                        ],
                      ),
                    ),

                  ListTile(
                    title: Text(
                      '${req.petName}의 ${req.stylePrompt ?? "AI"} 프로필',
                    ),
                    subtitle: Text(
                      DateFormat(
                        'yyyy.MM.dd HH:mm',
                      ).format(req.createdAt ?? DateTime.now()),
                    ),
                    trailing: req.status == AIRequestStatus.PROCESSING
                        ? const Text(
                            '진행중',
                            style: TextStyle(
                              color: Colors.blue,
                              fontWeight: FontWeight.bold,
                            ),
                          )
                        : (req.status == AIRequestStatus.COMPLETED
                              ? const Icon(Icons.download)
                              : const Text(
                                  '실패',
                                  style: TextStyle(color: Colors.red),
                                )),
                  ),
                ],
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}
