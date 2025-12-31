import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';

final fileRepositoryProvider = Provider<FileRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return FileRepository(apiClient);
});

class FileRepository {
  final ApiClient _apiClient;

  FileRepository(this._apiClient);

  Future<String> uploadFile(File file) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path),
    });

    final response = await _apiClient.post('/api/v1/files', data: formData);

    // Expecting { "url": "..." }
    return response.data['url'] as String;
  }
}
