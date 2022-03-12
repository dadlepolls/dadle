#!/usr/bin/env python3
import os
import json

LOCALES_DIR = os.path.join(os.path.dirname(__file__), "public/locales")
LANGUAGES = next(os.walk(LOCALES_DIR))[1]
translationItems = {
  el:set() for el in LANGUAGES + ["common"]
}

def main():
  for lang in LANGUAGES:
    for path, subdirs, files in os.walk(os.path.join(LOCALES_DIR, lang)):
      for name in files:
        with open(os.path.join(path, name), "r") as json_file:
          values = json.load(json_file)
          for item in values:
            translationItems["common"].add(item)
            translationItems[lang].add(item)
  
  print("Coverage: ")
  for lang in LANGUAGES:
    coverage = len(translationItems[lang]) / len(translationItems["common"])
    print(f"{lang}\t{(coverage * 100):.0f}%")

if __name__=="__main__":
  main()