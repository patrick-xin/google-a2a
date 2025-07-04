import { getAvailableDomains } from "@/services/news";
import { NewsFilters } from "./news-filters";

const FiltersSection = async () => {
  const domains = await getAvailableDomains();
  return <NewsFilters availableDomains={domains} />;
};

export default FiltersSection;
