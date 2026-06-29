function langField(lang: string, uz: string, ru: string, en: string) {
  if (lang === 'ru') return ru
  if (lang === 'en') return en
  return uz
}

export function localizeProduct(p: any, lang: string) {
  return {
    ...p,
    name: langField(lang, p.nameUz as string, p.nameRu as string, p.nameEn as string),
    description: langField(lang, p.descriptionUz as string, p.descriptionRu as string, p.descriptionEn as string),
    ingredients: langField(lang, p.ingredientsUz as string, p.ingredientsRu as string, p.ingredientsEn as string),
  }
}
