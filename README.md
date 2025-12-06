# 🏥 MediFlow - Healthcare Management App

A comprehensive mobile and web application for managing medical treatments, medicines, and health records. Built with React, TypeScript, and Capacitor for cross-platform support.

## ✨ Features

- 📱 **Responsive Web App** - Works on desktop and mobile browsers
- 🤖 **Native Mobile Apps** - iOS and Android support via Capacitor
- 🔐 **Secure Authentication** - Supabase integration with email/password auth
- 💊 **Treatment Management** - Create and manage treatment plans
- 💉 **Medicine Tracking** - Track medicines, dosages, and schedules
- 📊 **Health Dashboard** - View health statistics and progress
- 🔔 **Notifications** - Medicine reminders and alerts
- 📋 **Medical Records** - Store and access medical documents
- 🏃 **Recovery Reports** - Track recovery progress

## 🚀 Quick Start

### For Web Development

```bash
# Clone repository
git clone https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
cd MediFlow-Mobile-v1

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build
```

### For Mobile Development

```bash
# Setup mobile platforms
npm install --legacy-peer-deps
npm run build
npm run mobile:sync

# Open Android or iOS IDE
npm run mobile:open:android    # For Android
npm run mobile:open:ios        # For iOS (Mac only)
```

## 📱 Installation Guide

See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed instructions on:
- Setting up Android development environment
- Setting up iOS development environment
- Building and running on emulators
- Installing on physical devices
- Troubleshooting common issues

## 📚 Mobile Setup

See [MOBILE_SETUP.md](./MOBILE_SETUP.md) for:
- Available Capacitor plugins
- Development workflow
- Building for release
- App configuration
- Pro tips and best practices

## 🛠️ Available Scripts

```bash
# Web development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run build:dev             # Build in dev mode
npm run lint                  # Check code quality
npm run preview               # Preview production build

# Mobile development
npm run mobile:sync           # Sync to both platforms
npm run mobile:sync:android   # Sync to Android
npm run mobile:sync:ios       # Sync to iOS
npm run mobile:open:android   # Open Android Studio
npm run mobile:open:ios       # Open Xcode
npm run mobile:build          # Build both platforms
```

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Mobile**: Capacitor
- **State Management**: React Context, React Query
- **Forms**: React Hook Form, Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
MediFlow-Mobile-v1/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utility functions
│   └── integrations/        # Supabase integration
├── android/                 # Android native project
├── ios/                     # iOS native project
├── capacitor.config.ts     # Capacitor config
├── package.json             # Dependencies
└── README.md                # This file
```

## 🔑 Key Files

- `src/utils/capacitor-init.ts` - Mobile app initialization
- `src/utils/platform.ts` - Platform detection utilities
- `capacitor.config.ts` - Capacitor configuration
- `INSTALLATION_GUIDE.md` - Complete installation steps
- `MOBILE_SETUP.md` - Mobile development details

## 🔐 Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Platform Support

- ✅ **Web**: All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ **Android**: API 21+ (Android 5.0+)
- ✅ **iOS**: iOS 12+

## 🚦 Getting Help

- **Installation Issues**: See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
- **Mobile Setup**: See [MOBILE_SETUP.md](./MOBILE_SETUP.md)
- **Capacitor Docs**: https://capacitorjs.com/docs
- **GitHub Issues**: https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1/issues

## 📝 Development Tips

1. **Test on mobile**: Always test on actual devices before release
2. **Use DevTools**: Inspect elements in web view for debugging
3. **Check logs**: Use Android Studio logcat or Xcode console
4. **Stay updated**: Run `npx cap update` regularly

## 🔄 Workflow

1. Make changes in React components
2. Test on web: `npm run dev`
3. Build web app: `npm run build`
4. Sync to mobile: `npm run mobile:sync`
5. Test on mobile: Open Android Studio or Xcode

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created and maintained by the MediFlow team.

---

**Ready to build? Start with the [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)!** 🚀

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/eb1bb899-fd34-4660-a08b-5793bf692301) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)


PS C:\Users\hp\MediFlow-Mobile-10> npx cap init
[?] What is the name of your app?
    This should be a human-friendly app name, like what you'd see in the App
    Store.
√ Name ... MediFlow-v1
[?] What should be the Package ID for your app?
    Package IDs (aka Bundle ID in iOS and Application ID in Android) are unique
    identifiers for apps. They must be in reverse domain name notation,   
    generally representing a domain name that you or your company owns.   
√ Package ID ... com.nandishmediflow.app
√ Creating capacitor.config.ts in C:\Users\hp\MediFlow-Mobile-10 in 5.05ms[success] capacitor.config.ts created!

Next steps:
https://capacitorjs.com/docs/getting-started#where-to-go-next
[?] Join the Ionic Community! 💙
    Connect with millions of developers on the Ionic Forum and get access 
to
    live events, news updates, and more.
√ Create free Ionic account? ... no
Thank you for helping improve Capacitor by sharing anonymous usage data! ��
Information about the data we collect is available on our website: https://capacitorjs.com/docs/next/cli/telemetry
You can disable telemetry at any time by using the npx cap telemetry off cPS C:\Users\hp\MediFlow-Mobile-10> npm run build

> vite_react_shadcn_ts@0.0.0 build
> vite build

vite v7.2.4 building client environment for production...
transforming (1) src\main.tsxBrowserslist: browsers data (caniuse-lite) is 6 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 2454 modules transformed.
dist/index.html                     1.78 kB │ gzip:   0.65 kB
dist/assets/index-UVdmxsaS.css    100.51 kB │ gzip:  17.03 kB
dist/assets/index-B4UFmsTK.js   1,303.68 kB │ gzip: 342.41 kB

(!) Some chunks are larger than 500 kB after minification. Consider:      
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 35.59s
PS C:\Users\hp\MediFlow-Mobile-10> npx cap add android && npx cap add ios 
At line:1 char:21
+ npx cap add android && npx cap add ios
The token '&&' is not a valid statement separator in this version.        
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRe  
   cordException
    + FullyQualifiedErrorId : InvalidEndOfLine
 
PS C:\Users\hp\MediFlow-Mobile-10> npx cap add android
√ Adding native android project in android in 260.32ms
√ add in 261.44ms
√ Copying web assets from dist to android\app\src\main\assets\public in 31.05ms
√ Creating capacitor.config.json in android\app\src\main\assets in 1.90ms 
√ copy android in 220.24ms
√ Updating Android plugins in 62.33ms
[info] Found 5 Capacitor plugins for android:
       @capacitor/app@7.1.0
       @capacitor/camera@7.0.2
       @capacitor/device@7.0.2
       @capacitor/filesystem@7.1.5
√ update android in 357.96ms
√ Syncing Gradle in 717.20μs
[success] android platform added!
Follow the Developer Workflow guide to get building:
https://capacitorjs.com/docs/basics/workflow
PS C:\Users\hp\MediFlow-Mobile-10> npx cap add ios
√ Adding native Xcode project in ios in 83.70ms
√ add in 85.74ms
√ Copying web assets from dist to ios\App\App\public in 23.35ms
√ Creating capacitor.config.json in ios\App\App in 3.26ms
√ copy ios in 253.51ms
√ Updating iOS plugins in 36.61ms
- update ios [warn] Skipping pod install because CocoaPods is not installed
\ update ios [warn] Unable to find "xcodebuild". Skipping xcodebuild clean step...
√ Updating iOS native dependencies with pod install in 67.36ms
[info] Found 5 Capacitor plugins for ios:
       @capacitor/app@7.1.0
       @capacitor/camera@7.0.2
       @capacitor/device@7.0.2
       @capacitor/filesystem@7.1.5
√ update ios in 323.94ms
[success] ios platform added!
Follow the Developer Workflow guide to get building:
https://capacitorjs.com/docs/basics/workflow
PS C:\Users\hp\MediFlow-Mobile-10> npm install @capacitor/splash-screen --save --legacy-peer-deps


89 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS C:\Users\hp\MediFlow-Mobile-10> npm run build

> vite_react_shadcn_ts@0.0.0 build
> vite build

vite v7.2.4 building client environment for production...
transforming (1) src\main.tsxBrowserslist: browsers data (caniuse-lite) is 6 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 2463 modules transformed.
dist/index.html                     1.78 kB │ gzip:   0.65 kB
dist/assets/index-UVdmxsaS.css    100.51 kB │ gzip:  17.03 kB
dist/assets/web-DKOt3H7Z.js         0.12 kB │ gzip:   0.12 kB
dist/assets/web-DuMhGKXc.js         0.76 kB │ gzip:   0.35 kB
dist/assets/index-C29SeBex.js   1,313.26 kB │ gzip: 346.00 kB

(!) Some chunks are larger than 500 kB after minification. Consider:      
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 52.68s
PS C:\Users\hp\MediFlow-Mobile-10> npx cap sync
√ Copying web assets from dist to android\app\src\main\assets\public in 33.52ms
√ Creating capacitor.config.json in android\app\src\main\assets in 2.49ms 
√ copy android in 217.68ms
√ Updating Android plugins in 86.72ms
[info] Found 6 Capacitor plugins for android:
       @capacitor/app@7.1.0
       @capacitor/camera@7.0.2
       @capacitor/device@7.0.2
       @capacitor/filesystem@7.1.5
       @capacitor/geolocation@7.1.6
       @capacitor/splash-screen@7.0.3
√ update android in 362.63ms
√ Copying web assets from dist to ios\App\App\public in 22.27ms
√ Creating capacitor.config.json in ios\App\App in 1.16ms
√ copy ios in 356.46ms
√ Updating iOS plugins in 49.26ms
- update ios [warn] Skipping pod install because CocoaPods is not installed
\ Updating iOS native dependencies with pod install [warn] Unable to find 
"xcodebuild". Skipping xcodebuild clean step...
√ Updating iOS native dependencies with pod install in 68.75ms
[info] Found 6 Capacitor plugins for ios:
       @capacitor/app@7.1.0
       @capacitor/camera@7.0.2
       @capacitor/device@7.0.2
       @capacitor/filesystem@7.1.5
       @capacitor/geolocation@7.1.6
       @capacitor/splash-screen@7.0.3
√ update ios in 353.29ms
√ update web in 77.76ms
[info] Sync finished in 2.011s
PS C:\Users\hp\MediFlow-Mobile-10> git remote add origin https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
>> git push -u origin main
error: remote origin already exists.
Everything up-to-date
PS C:\Users\hp\MediFlow-Mobile-10> git remote add origin https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
error: remote origin already exists.
PS C:\Users\hp\MediFlow-Mobile-10> ^C
h)
origin  https://github.com/nandishgs0009-eng/MediFlow-Mobile-2.0.git (push)
PS C:\Users\hp\MediFlow-Mobile-10> git remote set-url origin https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
PS C:\Users\hp\MediFlow-Mobile-10> git push -u origin main
Enumerating objects: 423, done.
Counting objects: 100% (423/423), done.
Delta compression using up to 4 threads
Compressing objects: 100% (310/310), done.
Writing objects: 100% (423/423), 3.37 MiB | 748.00 KiB/s, done.
remote: Resolving deltas: 100% (234/234), done.
To https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
PS C:\Users\hp\MediFlow-Mobile-10> git add -A; git commit -m "feat: convert web app to mobile using Capacitor with Android and iOS support"
warning: in the working copy of 'android/.gitignore', LF will be replaced 
by CRLF the next time Git touches it
warning: in the working copy of 'android/app/.gitignore', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/build.gradle', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/capacitor.build.gradle', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/proguard-rules.pro', LF will 
be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java', LF will be replaced by CRLF 
the next time Git touches it
warning: in the working copy of 'android/app/src/main/AndroidManifest.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/java/com/nandishmediflow/app/MainActivity.java', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/res/drawable/ic_launcher_background.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/res/layout/activity_main.xml', LF will be replaced by CRLF the next time Git touches it       
warning: in the working copy of 'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', LF will be replaced by CRLF the next time Git touches 
it
warning: in the working copy of 'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/res/values/ic_launcher_background.xml', LF will be replaced by CRLF the next time Git touches 
it
warning: in the working copy of 'android/app/src/main/res/values/strings.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/res/values/styles.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/main/res/xml/file_paths.xml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/build.gradle', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/capacitor.settings.gradle', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/gradle.properties', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/gradle/wrapper/gradle-wrapper.properties', LF will be replaced by CRLF the next time Git touches it        
warning: in the working copy of 'android/gradlew', LF will be replaced by 
CRLF the next time Git touches it
warning: in the working copy of 'android/settings.gradle', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'android/variables.gradle', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'capacitor.config.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/.gitignore', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App.xcodeproj/project.pbxproj', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/AppDelegate.swift', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/Assets.xcassets/Contents.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/Assets.xcassets/Splash.imageset/Contents.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/Base.lproj/LaunchScreen.storyboard', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/Base.lproj/Main.storyboard', 
LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/App/Info.plist', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'ios/App/Podfile', LF will be replaced by 
CRLF the next time Git touches it
[main 9e96a65] feat: convert web app to mobile using Capacitor with Android and iOS support
 76 files changed, 3080 insertions(+), 14 deletions(-)
 create mode 100644 MOBILE_SETUP.md
 create mode 100644 android/.gitignore
 create mode 100644 android/app/.gitignore
 create mode 100644 android/app/build.gradle
 create mode 100644 android/app/capacitor.build.gradle
 create mode 100644 android/app/proguard-rules.pro
 create mode 100644 android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java
 create mode 100644 android/app/src/main/AndroidManifest.xml
 create mode 100644 android/app/src/main/java/com/nandishmediflow/app/MainActivity.java
 create mode 100644 android/app/src/main/res/drawable-land-hdpi/splash.png create mode 100644 android/app/src/main/res/drawable-land-mdpi/splash.png create mode 100644 android/app/src/main/res/drawable-land-xhdpi/splash.png
 create mode 100644 android/app/src/main/res/drawable-land-xxhdpi/splash.png
 create mode 100644 android/app/src/main/res/drawable-land-xxxhdpi/splash.png
 create mode 100644 android/app/src/main/res/drawable-port-hdpi/splash.png create mode 100644 android/app/src/main/res/drawable-port-mdpi/splash.png create mode 100644 android/app/src/main/res/drawable-port-xhdpi/splash.png
 create mode 100644 android/app/src/main/res/drawable-port-xxhdpi/splash.png
 create mode 100644 android/app/src/main/res/drawable-port-xxxhdpi/splash.png
 create mode 100644 android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml
 create mode 100644 android/app/src/main/res/drawable/ic_launcher_background.xml
 create mode 100644 android/app/src/main/res/drawable/splash.png
 create mode 100644 android/app/src/main/res/layout/activity_main.xml     
 create mode 100644 android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
 create mode 100644 android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml
 create mode 100644 android/app/src/main/res/mipmap-hdpi/ic_launcher.png  
 create mode 100644 android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
 create mode 100644 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
 create mode 100644 android/app/src/main/res/mipmap-mdpi/ic_launcher.png  
 create mode 100644 android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
 create mode 100644 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
 create mode 100644 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png 
 create mode 100644 android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
 create mode 100644 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
 create mode 100644 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png create mode 100644 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
 create mode 100644 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
 create mode 100644 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
 create mode 100644 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png
 create mode 100644 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
 create mode 100644 android/app/src/main/res/values/ic_launcher_background.xml
 create mode 100644 android/app/src/main/res/values/strings.xml
 create mode 100644 android/app/src/main/res/values/styles.xml
 create mode 100644 android/app/src/main/res/xml/file_paths.xml
 create mode 100644 android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java
 create mode 100644 android/build.gradle
 create mode 100644 android/capacitor.settings.gradle
 create mode 100644 android/gradle.properties
 create mode 100644 android/gradle/wrapper/gradle-wrapper.jar
 create mode 100644 android/gradle/wrapper/gradle-wrapper.properties      
 create mode 100644 android/gradlew
 create mode 100644 android/gradlew.bat
 create mode 100644 android/settings.gradle
 create mode 100644 android/variables.gradle
 create mode 100644 capacitor.config.ts
 create mode 100644 ios/.gitignore
 create mode 100644 ios/App/App.xcodeproj/project.pbxproj
 create mode 100644 ios/App/App.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist
 create mode 100644 ios/App/App/AppDelegate.swift
 create mode 100644 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
 create mode 100644 ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json
 create mode 100644 ios/App/App/Assets.xcassets/Contents.json
 create mode 100644 ios/App/App/Assets.xcassets/Splash.imageset/Contents.json
 create mode 100644 ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png
 create mode 100644 ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png
 create mode 100644 ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png
 create mode 100644 ios/App/App/Base.lproj/Main.storyboard
 create mode 100644 ios/App/App/Info.plist
 create mode 100644 src/utils/capacitor-init.ts
 create mode 100644 src/utils/platform.ts
PS C:\Users\hp\MediFlow-Mobile-10> git log --oneline -1
9e96a65 (HEAD -> main) feat: convert web app to mobile using Capacitor with Android and iOS support
PS C:\Users\hp\MediFlow-Mobile-10> git push origin main
Enumerating objects: 137, done.
Counting objects: 100% (137/137), done.
Delta compression using up to 4 threads
Compressing objects: 100% (100/100), done.
Total 129 (delta 8), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (8/8), completed with 7 local objects.     
To https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
   eca14aa..9e96a65  main -> main
PS C:\Users\hp\MediFlow-Mobile-10> git add -A; git commit -m "docs: add co[main e2f90f1] docs: add comprehensive mobile installation and setup guides
 3 files changed, 561 insertions(+), 17 deletions(-)
 create mode 100644 INSTALLATION_GUIDE.md
 create mode 100644 setup-mobile.bat
PS C:\Users\hp\MediFlow-Mobile-10> git push origin main
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 4 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 6.26 KiB | 801.00 KiB/s, done.
Total 5 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.      
To https://github.com/nandishgs0009-eng/MediFlow-Mobile-v1.git
   9e96a65..e2f90f1  main -> main
PS C:\Users\hp\MediFlow-Mobile-10> #   M e d i F l o w - A p p - v 1  
 