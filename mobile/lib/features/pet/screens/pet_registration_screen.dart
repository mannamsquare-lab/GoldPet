// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../home/providers/home_provider.dart';
import '../data/pet_model.dart';
import '../providers/pet_registration_provider.dart';

class PetRegistrationScreen extends ConsumerStatefulWidget {
  const PetRegistrationScreen({super.key});

  @override
  ConsumerState<PetRegistrationScreen> createState() =>
      _PetRegistrationScreenState();
}

class _PetRegistrationScreenState extends ConsumerState<PetRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _weightController = TextEditingController();
  String _gender = 'MALE'; // MALE, FEMALE
  DateTime? _birthDate;
  bool _isNeutered = false;

  @override
  void initState() {
    super.initState();
    // derived providers or init logic if needed
    // loading is handled by provider build()
  }

  @override
  void dispose() {
    _nameController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate() && _birthDate != null) {
      final formattedDate = DateFormat('yyyy-MM-dd').format(_birthDate!);
      ref
          .read(petRegistrationProvider.notifier)
          .submit(
            name: _nameController.text,
            gender: _gender,
            birthDate: formattedDate,
            weightKg: double.tryParse(_weightController.text) ?? 0.0,
            isNeutered: _isNeutered,
          );
    } else if (_birthDate == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('생년월일을 선택해주세요.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncState = ref.watch(petRegistrationProvider);

    ref.listen(petRegistrationProvider, (previous, next) {
      next.whenOrNull(
        data: (state) {
          if (state.isSuccess) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(const SnackBar(content: Text('펫이 등록되었습니다.')));
            ref.invalidate(homeProvider);
            context.pop();
          }
        },
        error: (err, st) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(err.toString())));
        },
      );
    });

    return Scaffold(
      appBar: AppBar(title: const Text('펫 등록')),
      body: asyncState.when(
        data: (state) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Species Dropdown
                DropdownButtonFormField<SpeciesModel>(
                  value: state.selectedSpecies,
                  decoration: const InputDecoration(labelText: '종류'),
                  items: state.speciesList
                      .map(
                        (s) => DropdownMenuItem(value: s, child: Text(s.name)),
                      )
                      .toList(),
                  onChanged: (value) {
                    if (value != null) {
                      ref
                          .read(petRegistrationProvider.notifier)
                          .selectSpecies(value);
                    }
                  },
                  validator: (v) => v == null ? '종류를 선택하세요' : null,
                ),
                const SizedBox(height: 16),
                // Breed Dropdown (dependent)
                DropdownButtonFormField<BreedModel>(
                  value: state.selectedBreed,
                  decoration: const InputDecoration(labelText: '품종'),
                  items: state.breedsList
                      .map(
                        (b) => DropdownMenuItem(value: b, child: Text(b.name)),
                      )
                      .toList(),
                  onChanged: state.selectedSpecies == null
                      ? null
                      : (value) {
                          if (value != null) {
                            ref
                                .read(petRegistrationProvider.notifier)
                                .selectBreed(value);
                          }
                        },
                ),
                const SizedBox(height: 16),
                // Name
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: '이름'),
                  validator: (v) => v?.isNotEmpty == true ? null : '이름을 입력하세요',
                ),
                const SizedBox(height: 16),
                // Gender
                Row(
                  children: [
                    const Text('성별: '),
                    Radio<String>(
                      value: 'MALE',
                      groupValue: _gender,
                      onChanged: (v) {
                        if (v != null) setState(() => _gender = v);
                      },
                    ),
                    const Text('수컷'),
                    Radio<String>(
                      value: 'FEMALE',
                      groupValue: _gender,
                      onChanged: (v) {
                        if (v != null) setState(() => _gender = v);
                      },
                    ),
                    const Text('암컷'),
                  ],
                ),
                const SizedBox(height: 16),
                // BirthDate
                ListTile(
                  title: Text(
                    _birthDate == null
                        ? '생년월일 선택'
                        : DateFormat('yyyy-MM-dd').format(_birthDate!),
                  ),
                  trailing: const Icon(Icons.calendar_today),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now(),
                      firstDate: DateTime(2000),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) setState(() => _birthDate = date);
                  },
                ),
                const SizedBox(height: 16),
                // Weight
                TextFormField(
                  controller: _weightController,
                  decoration: const InputDecoration(labelText: '몸무게 (kg)'),
                  keyboardType: TextInputType.number,
                  validator: (v) => v?.isNotEmpty == true ? null : '몸무게를 입력하세요',
                ),
                const SizedBox(height: 16),
                // Neutered
                CheckboxListTile(
                  title: const Text('중성화 여부'),
                  value: _isNeutered,
                  onChanged: (v) => setState(() => _isNeutered = v ?? false),
                ),
                const SizedBox(height: 32),
                ElevatedButton(onPressed: _submit, child: const Text('등록하기')),
              ],
            ),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
