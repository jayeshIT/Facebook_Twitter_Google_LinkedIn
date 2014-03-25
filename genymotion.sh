#!/bin/sh

#  genymotion.sh
#  AnimatedTableView
#
#  Created by indianic on 20/11/13.
#
rm -r build/android

ti build -p android -b

echo 'Installing Project to Device'
#
#/Volumes/DATA/ANDROID_SN/android-sdk-mac_86/platform-tools/adb install -r build/android/bin/app.apk
#

/Androidz/android-sdk-mac_86/platform-tools/adb install -r build/android/bin/app.apk


exit