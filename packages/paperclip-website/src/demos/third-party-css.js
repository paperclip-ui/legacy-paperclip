const SOURCE = `
<import src="tailwind.css" as="tw"  />


<!--
  @frame { width: 768, height: 768, x: 0, y: 0 }
-->

<div class="$tw.font-sans $tw.bg-gray-500 $tw.h-screen $tw.w-screen">
  <div class="$tw.bg-gray-100 $tw.rounded-lg $tw.p-8 $tw.md\:p-0">
    <div class="$tw.pt-6 $tw.text-center $tw.space-y-4">
      <blockquote>
        <p class="$tw.text-lg $tw.font-semibold">
          “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.”
        </p>
      </blockquote>
      <figcaption class="$tw.font-medium">
        <div class="$tw.text-blue-600">
          sit voluptatem
        </div>
      </figcaption>
    </div>
  </div>
</div>`;

export default SOURCE;