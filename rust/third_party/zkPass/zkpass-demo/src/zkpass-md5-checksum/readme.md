### How to use

```bash
Usage: zkpass-md5-checksum [OPTIONS] --in <file-in>

Options:
  -i, --in <file-in>
          (Required) Input file path

  -o, --out <file-out>
          Output file path

  -h, --help
          Print help (see a summary with '-h')
```

### Example

```bash
./target/release/zkpass-md5-checksum --in ./target/release/libr0_zkpass_query.so
```

```bash
771077cca8d7d351b0f882ff672ea258
```

### How to test

```bash
cargo test -p zkpass-md5-checksum
```

### Notes

- The generator automatically runs when `build/build.sh` is executed
- For `.so` file uploading to registry, the `.md5` file should be uploaded along with the binary file
