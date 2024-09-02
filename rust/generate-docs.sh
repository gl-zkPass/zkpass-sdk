#!/bin/bash
set -e

# Step 1: Generate documentation
cargo doc --no-deps -r -p zkpass-client

# Step 2: Copy doc folder
cp -r target/doc ../docs/

# Step 3: Rename trait.impl folder
mv ../docs/doc/trait.impl ../docs/doc/implementors

# Step 4: Replace references to trait.impl
find ../docs/doc -type f -name "*.html" -exec sed -i 's/trait\.impl/implementors/g' {} +

# Step 5: Modify all.html and index.html
for file in ../docs/doc/zkpass_client/all.html ../docs/doc/zkpass_client/index.html; do
    sed -i 's#<nav class="mobile-topbar"><button class="sidebar-menu-toggle" title="show sidebar"></button></nav>#<nav class="mobile-topbar"><button class="sidebar-menu-toggle" title="show sidebar"></button><a class="logo-container" href="../zkpass_client/index.html"><img class="rust-logo" src="../static.files/rust-logo-151179464ae7ed46.svg" alt="logo"></a></nav>#' "$file"
    sed -i 's#<nav class="sidebar"><div class="sidebar-crate"><h2><a href="../zkpass_client/index.html">zkpass_client</a>#<nav class="sidebar"><div class="sidebar-crate"><h2><a href="../zkpass_client/index.html"><img class="rust-logo" src="../static.files/rust-logo-151179464ae7ed46.svg" alt="logo"/>zkpass_client</a>#' "$file"
done

# Step 6: Modify HTML files in core and interface folders
find ../docs/doc/ -type f -name "*.html" -exec sed -i 's#<nav class="mobile-topbar"><button class="sidebar-menu-toggle" title="show sidebar"></button></nav>#<nav class="mobile-topbar"><button class="sidebar-menu-toggle" title="show sidebar"></button><a class="logo-container" href="../../zkpass_client/index.html"><img class="rust-logo" src="../../static.files/rust-logo-151179464ae7ed46.svg" alt="logo"></a></nav>#' {} +
find ../docs/doc/ -type f -name "*.html" -exec sed -i 's#<nav class="sidebar"><div class="sidebar-crate"><h2><a href="../../zkpass_client/index.html">zkpass_client</a>#<nav class="sidebar"><div class="sidebar-crate"><h2><a href="../../zkpass_client/index.html"><img class="rust-logo" src="../../static.files/rust-logo-151179464ae7ed46.svg" alt="logo"/>zkpass_client</a>#' {} +

# Step 7: Review new docs (manual step)
echo "Please review all the new docs for these criteria"
echo "=====What to test?=====
1. Make sure the logos are appearing on every pages
2. Make sure there aren't broken text style or any typos (for example, there is a tab on an unusual place)
3. Make sure the theme settings is working properly (dark, light, ayu)
4. Make sure the search feature is working
5. (Optional) Please compare this generated docs with the ones on the development, make sure there is no unmatch styling, wording, etc."
open ../docs/doc/zkpass_client/index.html
read -p "Press enter when you're ready to continue..."

# Step 8: Replace docs/rust folder
rm -rf ../docs/rust
mv ../docs/doc ../docs/rust

echo "Documentation generation and processing complete!"