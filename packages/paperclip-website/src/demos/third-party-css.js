const SOURCE = `

<!-- Keep Tailwind scoped to $tw -->
<import src="modules/tailwind.css" as="tw" />

<!-- You can even mix & match frameworks if you want-->
<import src="modules/bootstrap.css" as="bs" />


<div export component as="Card" class="$tw font-sans bg-gray-500 h-screen w-screen">
  <div class="$tw bg-gray-100 rounded-lg p-8 md\:p-0">
    <div class="$tw pt-6 text-center space-y-4">
      <blockquote>
        <p class="$tw text-lg font-semibold">
          {description}
        </p>
      </blockquote>
      <figcaption class="$tw font-medium">
        <div class="$tw text-blue-600">
          {caption}
        </div>
      </figcaption>
    </div>
  </div>
</div>`;

export default SOURCE;
