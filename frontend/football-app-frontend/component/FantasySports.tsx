import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {Button} from "@/components/ui/button"

export default function FantasySports() {
  const [fantasyPoints, setFantasyPoints] = useState(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fantasy Sports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-lg font-semibold">Your Fantasy Points: {fantasyPoints}</div>
          <Button onClick={() => setFantasyPoints(prev => prev + Math.floor(Math.random() * 10))}>
            Simulate Point Update
          </Button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Top Performers This Week</h3>
          <ul className="list-disc list-inside">
            <li>Player X - 25 points</li>
            <li>Player Y - 22 points</li>
            <li>Player Z - 20 points</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}