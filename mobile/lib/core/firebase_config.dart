import 'package:firebase_core/firebase_core.dart';
FirebaseOptions firebaseOptions() {
 const apiKey=String.fromEnvironment('FIREBASE_API_KEY');
 const appId=String.fromEnvironment('FIREBASE_APP_ID');
 const messagingSenderId=String.fromEnvironment('FIREBASE_SENDER_ID');
 const projectId=String.fromEnvironment('FIREBASE_PROJECT_ID');
 if([apiKey,appId,messagingSenderId,projectId].any((x)=>x.isEmpty)) {
  throw StateError('ENABLE_FCM requires all FIREBASE_* build settings');
 }
 return const FirebaseOptions(apiKey:apiKey,appId:appId,messagingSenderId:messagingSenderId,projectId:projectId);
}
