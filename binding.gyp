{
  "targets": [
    {
      "target_name": "speedup",
      "sources": ["src/speedup.cc"],
      "include_dirs": ["<!(node -e \"require('nan')\")"],
    }
  ]
}
