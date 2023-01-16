resource "commercetools_store" "us-store" {
  key = "us-store"
  name = {
    en-US = "US store"
  }
  languages = ["en-US"]
}

resource "commercetools_store" "it-store" {
  key = "it-store"
  name = {
    it = "IT store"
  }
  languages = ["it"]
}
