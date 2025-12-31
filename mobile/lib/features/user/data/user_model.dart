import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
sealed class UserModel with _$UserModel {
  const factory UserModel({
    required int id,
    String? email,
    String? nickname,
    String? gender,
    int? birthYear,
    String? mainLocationText,
    double? mainLocationLat,
    double? mainLocationLng,
    String? profileImageUrl,
    @Default(0) int goldBalance,
    @Default(true) bool isActive,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}
