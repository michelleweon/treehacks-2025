import { Separator } from "@/components/ui/separator";
import { TypographyH2, TypographyP } from "@/components/ui/typography";

export default function Home() {
  return (
    <>
      <TypographyH2>
        <span className="text-green-400">SquadPulse</span>: Your Mission-Critical Healthcare Analytics Platform in Real Time
      </TypographyH2>
      <TypographyP>
        SquadPulse uses the Terra.AI API to perform personalized data analysis on your health metrics from wearing the Ultrahuman Air Rings. 
      </TypographyP>
      <TypographyP>To see the data page, log in in the top right!</TypographyP>
      <Separator className="my-4" />
      <TypographyP>
        See your data metrics for heart rate, physical activity, mental health well being, and sleep tracking. 
      </TypographyP>
    </>
  );
}
