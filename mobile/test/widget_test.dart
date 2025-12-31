import 'package:flutter_test/flutter_test.dart';
import 'package:goldpet/main.dart';

void main() {
  testWidgets('App launches without errors', (WidgetTester tester) async {
    await tester.pumpWidget(const GoldPetApp());
    // App should launch without throwing
    expect(find.byType(GoldPetApp), findsOneWidget);
  });
}
