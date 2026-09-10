import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'core/api.dart';
import 'core/brand.dart';
import 'screens.dart';
@pragma('vm:entry-point')
Future<void> backgroundMessage(RemoteMessage message) async { await Firebase.initializeApp(); }
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (const bool.fromEnvironment('ENABLE_FCM')) {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(backgroundMessage);
  }
  runApp(const ProviderScope(child: KhabarFori()));
}
class KhabarFori extends StatelessWidget {
  const KhabarFori({super.key});
  @override Widget build(BuildContext context) => MaterialApp(
    title: 'KhabarFori', debugShowCheckedModeBanner: false,
    locale: const Locale('fa'), supportedLocales: const [Locale('fa'), Locale('en')],
    localizationsDelegates: GlobalMaterialLocalizations.delegates,
    theme: ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff165d49)), scaffoldBackgroundColor: const Color(0xfff5f7f6), appBarTheme: const AppBarTheme(backgroundColor: Colors.white), inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder())),
    home: const SplashScreen(),
  );
}
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override ConsumerState<SplashScreen> createState() => _SplashState();
}
class _SplashState extends ConsumerState<SplashScreen> {
  @override void initState() { super.initState(); _start(); }
  Future<void> _start() async {
    await ref.read(apiProvider).storage.read(key: 'access_token');
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
  }
  @override Widget build(BuildContext context) => Scaffold(body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Image.asset(brandLogo, width: 180), const SizedBox(height: 24), const CircularProgressIndicator()])));
}
