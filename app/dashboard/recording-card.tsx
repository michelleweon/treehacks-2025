import SeeMoreDialog from "../monitor/see-more-dialog";

const { data: metadata } = await supabase
  .from("metadata")
  .select("*")
  .eq("filename", filename)
  .single();

<SeeMoreDialog filename={filename} metadata={metadata} />
