---
isDraft: true
---

hdiutil create -layout NONE -volname ZFS -type SPARSE zfs.sparseimage
hdiutil attach -nomount zfs.sparseimage
sudo zpool create -f -m ~/tank tank /dev/disk4
sudo zfs set compression=on tank
