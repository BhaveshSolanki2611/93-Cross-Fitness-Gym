#!/usr/bin/env bash
# Downloads free-licensed (Unsplash license) fitness stock images into
# public/images/stock/. Each download is verified to be a real JPEG >20KB.
set -u
DIR="public/images/stock"
mkdir -p "$DIR"

declare -A IMAGES=(
  # slug=unsplash photo id
  [hero-gym]="photo-1534438327276-14e5300c3a48"
  [weights-rack]="photo-1517836357463-d25dfeac3438"
  [dark-gym]="photo-1571902943202-507ec2618e8f"
  [barbell-lift]="photo-1526506118085-60ce8714f8c5"
  [kettlebell]="photo-1517963879433-6ad2b056d712"
  [crossfit]="photo-1533560904424-a0c61dc306fc"
  [hiit]="photo-1518611012118-696072aa579a"
  [personal-training]="photo-1571019613454-1cb2f99b2d8b"
  [weight-training]="photo-1581009146145-b5ef050c2e1e"
  [zumba]="photo-1524594152303-9fd13543fe6e"
  [yoga]="photo-1544367567-0f2fcb009e0b"
  [yoga-2]="photo-1545205597-3d9d02c29597"
  [pilates]="photo-1518310383802-640c2de311b2"
  [aerobics]="photo-1571388208497-71bedc66e932"
  [dance-fitness]="photo-1508700115892-45ecd05ae2ad"
  [cycling]="photo-1534787238916-9ba6764efd4f"
  [nutrition]="photo-1490645935967-10de6ba17061"
  [nutrition-2]="photo-1512621776951-a57141f2eefd"
  [spa]="photo-1540555700478-4be289fbecef"
  [spa-2]="photo-1544161515-4ab6ce6db874"
  [equipment-1]="photo-1540497077202-7c8a3999166f"
  [equipment-2]="photo-1574680096145-d05b474e2155"
  [equipment-3]="photo-1583454110551-21f2fa2afe61"
  [equipment-4]="photo-1554284126-aa88f22d8b74"
  [blog-1]="photo-1549060279-7e168fcee0c2"
  [blog-2]="photo-1532029837206-abbe2b7620e3"
  [blog-3]="photo-1494390248081-4e521a5940db"
  [about]="photo-1593079831268-3381b0db4a77"
)

ok=0; fail=0
for name in "${!IMAGES[@]}"; do
  id="${IMAGES[$name]}"
  url="https://images.unsplash.com/${id}?w=1600&q=75&fm=jpg&fit=crop"
  out="$DIR/${name}.jpg"
  curl -sL --max-time 30 "$url" -o "$out"
  # verify: must be JPEG magic bytes and >20KB
  size=$(stat -c%s "$out" 2>/dev/null || echo 0)
  magic=$(head -c 3 "$out" | xxd -p 2>/dev/null || echo "")
  if [ "$size" -gt 20000 ] && [ "$magic" = "ffd8ff" ]; then
    echo "OK   $name ($((size/1024))KB)"
    ok=$((ok+1))
  else
    echo "FAIL $name (size=$size)"
    rm -f "$out"
    fail=$((fail+1))
  fi
done
echo "----"
echo "Downloaded: $ok, Failed: $fail"
